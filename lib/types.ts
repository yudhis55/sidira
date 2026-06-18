export interface Room {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  bg: string;
  pj: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  room_id: string;
  name: string;
  category: 'alkes' | 'meubelair' | 'elektronik' | 'lainnya';
  merk?: string;
  type?: string;
  year?: number;
  quantity: number;
  unit: string;
  condition: 'baik' | 'rr' | 'rb' | 'ta';
  notes?: string;
  index_in_room: number;
  created_at: string;
  updated_at: string;
}

export interface Sbbk {
  id: string;
  sbbk_number: string;
  date: string;
  recipient: string;
  items: SbbkItem[];
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface SbbkItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Pakta {
  id: string;
  pakta_number: string;
  date: string;
  officer_name: string;
  officer_position: string;
  officer_nip?: string;
  vehicles: PaktaVehicle[];
  laptops: PaktaLaptop[];
  equipment: PaktaEquipment[];
  notes?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface PaktaVehicle {
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  plate_number: string;
  condition: string;
}

export interface PaktaLaptop {
  brand: string;
  model: string;
  serial_number: string;
  condition: string;
}

export interface PaktaEquipment {
  name: string;
  quantity: number;
  condition: string;
}

export interface Utility {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  last_maintenance?: string;
  next_maintenance?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface Checklist {
  id: string;
  room_id: string;
  date: string;
  items: ChecklistItem[];
  notes?: string;
  checked_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  item_id: string;
  item_name: string;
  condition: string;
  notes?: string;
}

export interface Usulan {
  id: string;
  room_id: string;
  title: string;
  description: string;
  priority: string;
  estimated_cost: number;
  status: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface Log {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id: string;
  timestamp: string;
  details?: any;
}
