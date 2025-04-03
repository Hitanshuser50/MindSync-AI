-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own chat messages
CREATE POLICY select_own_chat_messages ON chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own chat messages
CREATE POLICY insert_own_chat_messages ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own chat messages
CREATE POLICY delete_own_chat_messages ON chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

