// src/lib/supabaseClient.ts
// [ ]: 記事数が1000件を超えた時、データベースの正規化を考える。

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);