import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  description: string | null;
  pj: string | null;
  order_index: number;
}

interface Item {
  room_id: string;
  category: string;
  name: string;
  merk: string | null;
  type: string | null;
  year: number | null;
  quantity: number;
  unit: string;
  condition: string;
  notes: string | null;
  index_in_room: number;
}

async function applySeed() {
  console.log('🚀 Starting seed application...\n');

  // Read SQL file to parse data
  const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20260620000000_seed_rooms_and_items.sql');
  console.log(`📄 Reading SQL file: ${sqlPath}`);

  let sql: string;
  try {
    sql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ SQL file loaded successfully\n');
  } catch (err) {
    console.error('❌ Error reading SQL file:', err);
    process.exit(1);
  }

  // Parse rooms from SQL
  console.log('📦 Parsing rooms...');
  const rooms: Room[] = [];
  const roomRegex = /INSERT INTO rooms .*? VALUES \('([^']+)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', (\d+), NOW\(\)\) ON CONFLICT/g;
  let match;

  while ((match = roomRegex.exec(sql)) !== null) {
    rooms.push({
      id: match[1],
      name: match[2],
      icon: match[3],
      color: match[4],
      bg: match[5],
      description: match[6],
      pj: match[7],
      order_index: parseInt(match[8]),
    });
  }

  console.log(`✅ Parsed ${rooms.length} rooms\n`);

  // Parse items from SQL
  console.log('📦 Parsing items...');
  const items: Item[] = [];
  const lines = sql.split('\n');

  for (const line of lines) {
    if (!line.includes('INSERT INTO items')) continue;

    // Extract VALUES part
    const valuesMatch = line.match(/VALUES \((.*)\);?$/);
    if (!valuesMatch) continue;

    const valuesStr = valuesMatch[1];

    // Parse values - handle empty strings and NULL
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];

      if (char === "'" && valuesStr[i - 1] !== '\\') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < 10) {
      console.log(`⚠️  Skipping malformed line: ${line.substring(0, 50)}...`);
      continue;
    }

    // Extract values
    const room_id = values[0].replace(/^'|'$/g, '');
    const category = values[1].replace(/^'|'$/g, '');
    const name = values[2].replace(/^'|'$/g, '');
    const merk = values[3].replace(/^'|'$/g, '') || null;
    const type = values[4].replace(/^'|'$/g, '') || null;
    const year = values[5] === 'NULL' ? null : parseInt(values[5]);
    const quantity = parseInt(values[6]);
    const unit = values[7].replace(/^'|'$/g, '');
    const condition = values[8].replace(/^'|'$/g, '');
    const notes = values[9].replace(/^'|'$/g, '') || null;

    items.push({
      room_id,
      category,
      name,
      merk,
      type,
      year,
      quantity,
      unit,
      condition,
      notes,
      index_in_room: items.filter(i => i.room_id === room_id).length,
    });
  }

  console.log(`✅ Parsed ${items.length} items\n`);

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await supabase.from('items').delete().neq('id', 0);
  await supabase.from('rooms').delete().neq('id', '');
  console.log('✅ Existing data cleared\n');

  // Insert rooms
  console.log('📥 Inserting rooms...');
  const { error: roomsError } = await supabase.from('rooms').insert(rooms);

  if (roomsError) {
    console.error('❌ Error inserting rooms:', roomsError);
    process.exit(1);
  }

  console.log(`✅ Inserted ${rooms.length} rooms\n`);

  // Insert items in batches (Supabase has a limit per request)
  console.log('📥 Inserting items in batches...');
  const batchSize = 100;
  let successCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await supabase.from('items').insert(batch);

    if (error) {
      console.error(`❌ Error inserting items batch ${Math.floor(i / batchSize) + 1}:`, error);
    } else {
      successCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items`);
    }
  }

  console.log(`\n✅ Total items inserted: ${successCount}/${items.length}\n`);

  // Verify data
  console.log('🔍 Verifying data...');

  const { count: roomsCount } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true });

  const { count: itemsCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  console.log(`   📦 Rooms: ${roomsCount || 0}`);
  console.log(`   📦 Items: ${itemsCount || 0}`);

  if (roomsCount === 51 && itemsCount === 762) {
    console.log('\n✅ All data seeded successfully!');
    console.log('\n🎉 You can now test the application at http://localhost:3000');
  } else {
    console.log('\n⚠️  Data count mismatch.');
    console.log(`   Expected: 51 rooms, 762 items`);
    console.log(`   Actual: ${roomsCount || 0} rooms, ${itemsCount || 0} items`);
  }
}

applySeed().catch(console.error);
