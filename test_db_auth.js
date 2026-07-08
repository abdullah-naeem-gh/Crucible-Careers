
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'test@example.com', password: 'password123' });
  if (error) { console.log('Auth error:', error.message); return; }
  const res = await supabase.from('profiles').select('company, id').eq('id', data.user.id);
  console.log('Profiles select:', res);
})();

