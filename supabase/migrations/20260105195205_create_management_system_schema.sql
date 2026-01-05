/*
  # 7 Star International Management System Schema

  ## Overview
  Complete multi-region management system for UAE and Saudi Arabia operations
  with role-based access control and comprehensive event/material/payment tracking.

  ## Tables Created

  ### 1. profiles
  Extended user profiles linked to auth.users
  - id (uuid, references auth.users)
  - email (text)
  - full_name (text)
  - role (text): 'admin', 'senior_manager', 'manager'
  - region (text): 'uae', 'saudi'
  - contact_number (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. events
  Company events/projects tracking
  - id (uuid, primary key)
  - title (text)
  - description (text)
  - region (text): 'uae', 'saudi'
  - event_date (date)
  - end_date (date, optional)
  - status (text): 'planned', 'in_progress', 'completed', 'cancelled'
  - manager_id (uuid, references profiles)
  - location (text)
  - created_by (uuid, references profiles)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. materials
  Materials used in events with cost tracking
  - id (uuid, primary key)
  - event_id (uuid, references events)
  - material_name (text)
  - quantity (numeric)
  - unit (text)
  - unit_cost (numeric)
  - total_cost (numeric)
  - supplier (text, optional)
  - notes (text, optional)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 4. payments
  Payment tracking for events
  - id (uuid, primary key)
  - event_id (uuid, references events)
  - amount (numeric)
  - payment_type (text): 'received', 'pending'
  - payment_date (date)
  - payment_method (text, optional)
  - client_name (text)
  - notes (text, optional)
  - status (text): 'pending', 'completed', 'overdue'
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 5. invoices
  Invoice generation and tracking
  - id (uuid, primary key)
  - invoice_number (text, unique)
  - event_id (uuid, references events)
  - client_name (text)
  - client_contact (text)
  - issue_date (date)
  - due_date (date)
  - total_amount (numeric)
  - status (text): 'draft', 'sent', 'paid', 'overdue'
  - notes (text, optional)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ## Security
  
  ### Row Level Security (RLS) Policies:
  
  #### Admin Access:
  - Full access to all tables across all regions
  
  #### Senior Manager Access:
  - Full access to their assigned region's data
  
  #### Manager Access:
  - Read access to their region's events
  - Full access to events they manage
  - Full access to materials/payments/invoices for their events

  ## Important Notes
  1. All tables have RLS enabled for maximum security
  2. Region-based data isolation prevents cross-region data leakage
  3. Timestamps track all changes for audit trails
  4. Foreign key constraints ensure data integrity
  5. Indexes added for performance on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'senior_manager', 'manager')),
  region text NOT NULL CHECK (region IN ('uae', 'saudi')),
  contact_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  region text NOT NULL CHECK (region IN ('uae', 'saudi')),
  event_date date NOT NULL,
  end_date date,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  location text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  unit_cost numeric NOT NULL CHECK (unit_cost >= 0),
  total_cost numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  supplier text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_type text NOT NULL CHECK (payment_type IN ('received', 'pending')),
  payment_date date NOT NULL,
  payment_method text,
  client_name text NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_contact text NOT NULL,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region);
CREATE INDEX IF NOT EXISTS idx_events_manager ON events(manager_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_materials_event ON materials(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_event ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_invoices_event ON invoices(event_id);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view profiles in their region"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    region = (SELECT region FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view events in their region"
  ON events FOR SELECT
  TO authenticated
  USING (
    region = (SELECT region FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins and senior managers can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'senior_manager')
    )
    AND (
      region = (SELECT region FROM profiles WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admins and managers can update events in their region"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin'
        OR (p.role IN ('senior_manager', 'manager') AND p.region = events.region)
        OR events.manager_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin'
        OR (p.role IN ('senior_manager', 'manager') AND p.region = events.region)
        OR events.manager_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins and senior managers can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'senior_manager' AND profiles.region = events.region)
      )
    )
  );

-- Materials policies
CREATE POLICY "Users can view materials for events in their region"
  ON materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = materials.event_id
      AND (p.role = 'admin' OR e.region = p.region)
    )
  );

CREATE POLICY "Managers can insert materials for their events"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = materials.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can update materials for their events"
  ON materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = materials.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = materials.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can delete materials for their events"
  ON materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = materials.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

-- Payments policies (same pattern as materials)
CREATE POLICY "Users can view payments for events in their region"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = payments.event_id
      AND (p.role = 'admin' OR e.region = p.region)
    )
  );

CREATE POLICY "Managers can insert payments for their events"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = payments.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can update payments for their events"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = payments.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = payments.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can delete payments for their events"
  ON payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = payments.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

-- Invoices policies (same pattern as materials and payments)
CREATE POLICY "Users can view invoices for events in their region"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = invoices.event_id
      AND (p.role = 'admin' OR e.region = p.region)
    )
  );

CREATE POLICY "Managers can insert invoices for their events"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = invoices.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can update invoices for their events"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = invoices.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = invoices.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

CREATE POLICY "Managers can delete invoices for their events"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = invoices.event_id
      AND (
        p.role = 'admin'
        OR e.manager_id = auth.uid()
        OR (p.role = 'senior_manager' AND e.region = p.region)
      )
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();