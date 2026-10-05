-- ============================================================================
-- S1 · Seed LOCAL — compte administrateur de développement
-- ----------------------------------------------------------------------------
-- ⚠️  CE FICHIER EST LOCAL UNIQUEMENT. NE JAMAIS LE POUSSER VERS LE CLOUD.
--     Il crée admin@jtnova.local / admin123 (mot de passe trivial, vérifié dans
--     le journal des décisions de docs/STATUS.md). Le vrai compte administrateur
--     est créé en S3 par l'humain, avec un mot de passe saisi hors de tout
--     échange (cf. AGENTS.md §3 AUTH et §9).
--
--     Conséquence pratique : ne jamais lancer `supabase db push --include-seed`
--     sur le projet linked, car cette option applique [db.seed] sql_paths et donc
--     CE fichier. Les contenus éditoriaux se chargent dans le cloud via l'éditeur
--     SQL (ou en collant seed.sql, qui ne contient plus aucun compte).
--
-- Appliqué automatiquement par `supabase db reset` via [db.seed] sql_paths.
-- ============================================================================

-- ── Administrateur local ────────────────────────────────────────────────────
-- Compte de développement local. Ne jamais reproduire en production.
-- L'utilisateur GoTrue est créé avec son identité (auth.identities) car le CLI
-- ne fournit aucun utilisateur par défaut ; le profil admin en découle.
do $$
declare
  admin_id                uuid;
  v_identity_data         jsonb;
  v_identity_id_generated boolean;
  v_provider_id_generated boolean;
begin
  select id into admin_id from auth.users where email = 'admin@jtnova.local';

  if admin_id is null then
    admin_id := gen_random_uuid(); -- pas de défaut sur auth.users.id : GoTrue le génère côté app

    -- Les colonnes de jetons doivent être '' (et non NULL) : GoTrue les
    -- scanne comme des chaînes non nulles au login.
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                            email_confirmed_at, raw_app_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new,
                            email_change, email_change_token_current,
                            phone_change_token, phone, phone_change, reauthentication_token)
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@jtnova.local',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(),
      now(),
      '', '', '',
      '', '',
      '', '', '', ''
    );

    -- Identité GoTrue : selon la version, identity_id / provider_id sont
    -- générées depuis identity_data ou de simples colonnes NOT NULL. On
    -- construit l'insert d'après le schéma réel pour rester compatible.
    v_identity_data := jsonb_build_object(
      'sub', admin_id::text,
      'provider', 'email',
      'email', 'admin@jtnova.local',
      'email_verified', true
    );

    select
      coalesce((select is_generated = 'ALWAYS' from information_schema.columns
                where table_schema = 'auth' and table_name = 'identities'
                  and column_name = 'identity_id'), true),
      coalesce((select is_generated = 'ALWAYS' from information_schema.columns
                where table_schema = 'auth' and table_name = 'identities'
                  and column_name = 'provider_id'), false)
    into v_identity_id_generated, v_provider_id_generated;

    -- created_at / updated_at n'ont pas de défaut mais GoTrue les scanne
    -- comme des time.Time non nulles : il faut les fournir explicitement.
    if v_provider_id_generated and v_identity_id_generated then
      insert into auth.identities (user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (admin_id, v_identity_data, 'email', now(), now(), now());
    elsif v_provider_id_generated then
      insert into auth.identities (user_id, identity_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (admin_id, admin_id::text, v_identity_data, 'email', now(), now(), now());
    elsif v_identity_id_generated then
      insert into auth.identities (user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (admin_id, 'email', v_identity_data, 'email', now(), now(), now());
    else
      insert into auth.identities (user_id, provider_id, identity_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (admin_id, 'email', admin_id::text, v_identity_data, 'email', now(), now(), now());
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (admin_id, 'admin@jtnova.local', 'Administrateur', 'admin')
  on conflict (id) do nothing;
end $$;
