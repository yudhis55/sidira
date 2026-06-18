import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    email: 'sidira@sidira.local',
    password: 'sidira2026',
    username: 'sidira',
    nama: 'Admin SIDIRA',
    jabatan: 'Administrator',
    role: 'admin',
    avatar: '👨‍💼',
  },
  {
    email: 'kapus@sidira.local',
    password: 'kapus2026',
    username: 'kapus',
    nama: 'Kepala Puskesmas',
    jabatan: 'Kepala Puskesmas',
    role: 'viewer',
    avatar: '👨‍⚕️',
  },
  {
    email: 'pengurus@sidira.local',
    password: 'barang2026',
    username: 'pengurus',
    nama: 'Pengurus Barang',
    jabatan: 'Pengurus Barang',
    role: 'editor',
    avatar: '📦',
  },
];

async function setupUsers() {
  console.log('🚀 Starting user setup...\n');

  // Step 1: List existing users
  console.log('📋 Checking existing users...');
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  console.log(`   Found ${existingUsers?.users?.length || 0} existing users\n`);

  // Step 2: Create users via Auth API
  for (const user of users) {
    console.log(`📝 Processing ${user.email}...`);

    // Check if user already exists
    const existing = existingUsers?.users?.find(u => u.email === user.email);

    if (existing) {
      console.log(`   ⚠️  User already exists, deleting...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existing.id);
      if (deleteError) {
        console.error(`   ❌ Failed to delete: ${deleteError.message}`);
        continue;
      }
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        username: user.username,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        avatar: user.avatar,
      },
    });

    if (error) {
      console.error(`   ❌ Failed to create user: ${error.message}`);
      continue;
    }

    console.log(`   ✅ User created: ${data.user.id}`);

    // Manually insert profile (trigger might not work with service_role)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username: user.username,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        avatar: user.avatar,
      });

    if (profileError) {
      console.error(`   ❌ Failed to create profile: ${profileError.message}`);
    } else {
      console.log(`   ✅ Profile created`);
    }

    console.log('');
  }

  // Step 3: Verify
  console.log('🔍 Verifying setup...\n');

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('username, nama, jabatan, role, avatar')
    .order('role');

  if (profileError) {
    console.error('❌ Failed to fetch profiles:', profileError.message);
    process.exit(1);
  }

  console.log('📊 Profiles:');
  console.table(profiles);

  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  console.log(`\n👥 Total users in auth.users: ${finalUsers?.users?.length || 0}`);

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin:    sidira / sidira2026');
  console.log('   Editor:   pengurus / barang2026');
  console.log('   Viewer:   kapus / kapus2026\n');
}

setupUsers().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
