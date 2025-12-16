-- Migration Script für Sport-Event Management
-- Manuell im Supabase SQL-Editor ausführen

-- Spieler Tabelle
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Tabelle
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  time_from TIME NOT NULL,
  time_to TIME NOT NULL,
  created_by UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utensilien Tabelle
CREATE TABLE IF NOT EXISTS utensils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Responses (Zusagen/Absagen)
CREATE TABLE IF NOT EXISTS event_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  response_type TEXT CHECK (response_type IN ('zusage', 'absage')) NOT NULL,
  comment TEXT,
  guest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, player_id)
);

-- Utensilien Zuordnung zu Event-Responses
CREATE TABLE IF NOT EXISTS response_utensils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES event_responses(id) ON DELETE CASCADE NOT NULL,
  utensil_id UUID REFERENCES utensils(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(response_id, utensil_id)
);

-- Indexes für Performance
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_event_responses_event ON event_responses(event_id);
CREATE INDEX idx_event_responses_player ON event_responses(player_id);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_active ON players(is_active);

-- Row Level Security (RLS) aktivieren
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE utensils ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_utensils ENABLE ROW LEVEL SECURITY;

-- RLS Policies für players
CREATE POLICY "Players können sich selbst sehen"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Nur Admins können Spieler ändern"
  ON players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies für events
CREATE POLICY "Alle können Events sehen"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Nur Admins können Events erstellen"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Nur Admins können Events ändern"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies für event_responses
CREATE POLICY "Alle können Responses sehen"
  ON event_responses FOR SELECT
  USING (true);

CREATE POLICY "Spieler können eigene Responses erstellen"
  ON event_responses FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Spieler können eigene Responses ändern"
  ON event_responses FOR UPDATE
  USING (player_id = auth.uid());

CREATE POLICY "Spieler können eigene Responses löschen"
  ON event_responses FOR DELETE
  USING (player_id = auth.uid());

-- RLS Policies für utensils
CREATE POLICY "Alle können Utensilien sehen"
  ON utensils FOR SELECT
  USING (true);

CREATE POLICY "Nur Admins können Utensilien verwalten"
  ON utensils FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies für response_utensils
CREATE POLICY "Alle können Response-Utensilien sehen"
  ON response_utensils FOR SELECT
  USING (true);

CREATE POLICY "Spieler können eigene Response-Utensilien verwalten"
  ON response_utensils FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM event_responses
      WHERE id = response_id AND player_id = auth.uid()
    )
  );

-- Standard Utensilien einfügen
INSERT INTO utensils (name, icon) VALUES
  ('Ball', '⚽'),
  ('Pumpe', '🔧'),
  ('Überzieher', '👕')
ON CONFLICT DO NOTHING;

-- Funktion für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_responses_updated_at
  BEFORE UPDATE ON event_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();