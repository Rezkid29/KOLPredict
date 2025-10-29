--
-- PostgreSQL database dump
--

\restrict 5sMkQs00sfqqVFkSXSQaQGBhNxhXk1a6ba8VASTiWlgDS2p2WfQeeRkHYPqOUa7

-- Dumped from database version 17.5 (6bc9ef8)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.achievements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    category text NOT NULL,
    requirement text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievements OWNER TO neondb_owner;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activities OWNER TO neondb_owner;

--
-- Name: bets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    market_id character varying NOT NULL,
    "position" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    price numeric(18,9) NOT NULL,
    shares numeric(18,9) NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    profit numeric(18,9),
    average_cost numeric(18,9),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bets OWNER TO neondb_owner;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    market_id character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user1_id character varying NOT NULL,
    user2_id character varying NOT NULL,
    last_message_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.faqs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faqs OWNER TO neondb_owner;

--
-- Name: follower_cache; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.follower_cache (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    x_handle text NOT NULL,
    followers integer NOT NULL,
    cached_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.follower_cache OWNER TO neondb_owner;

--
-- Name: forum_comment_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_comment_votes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    comment_id character varying NOT NULL,
    user_id character varying NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_comment_votes OWNER TO neondb_owner;

--
-- Name: forum_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_comments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    thread_id character varying NOT NULL,
    user_id character varying NOT NULL,
    content text NOT NULL,
    parent_id character varying,
    upvotes integer DEFAULT 0 NOT NULL,
    downvotes integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_comments OWNER TO neondb_owner;

--
-- Name: forum_thread_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_thread_votes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    thread_id character varying NOT NULL,
    user_id character varying NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_thread_votes OWNER TO neondb_owner;

--
-- Name: forum_threads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_threads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    downvotes integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_threads OWNER TO neondb_owner;

--
-- Name: kol_metrics_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kol_metrics_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    kol_id character varying NOT NULL,
    followers integer NOT NULL,
    engagement_rate numeric(5,2) NOT NULL,
    trending boolean DEFAULT false NOT NULL,
    trending_percent numeric(5,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.kol_metrics_history OWNER TO neondb_owner;

--
-- Name: kols; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kols (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    handle text NOT NULL,
    avatar text NOT NULL,
    followers integer NOT NULL,
    engagement_rate numeric(5,2) NOT NULL,
    tier text NOT NULL,
    trending boolean DEFAULT false NOT NULL,
    trending_percent numeric(5,2),
    kolscan_rank text,
    kolscan_wins integer,
    kolscan_losses integer,
    kolscan_sol_gain text,
    kolscan_usd_gain text,
    last_scraped_at timestamp without time zone,
    scraped_from_kolscan boolean DEFAULT false NOT NULL
);


ALTER TABLE public.kols OWNER TO neondb_owner;

--
-- Name: market_metadata; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.market_metadata (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    market_id character varying NOT NULL,
    market_type text NOT NULL,
    kol_a text,
    kol_b text,
    x_handle text,
    current_followers integer,
    current_rank_a text,
    current_rank_b text,
    current_usd text,
    current_sol_a text,
    current_sol_b text,
    current_usd_a text,
    current_usd_b text,
    current_wins_losses_a text,
    current_wins_losses_b text,
    threshold numeric(5,2),
    timeframe_days integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.market_metadata OWNER TO neondb_owner;

--
-- Name: markets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.markets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    kol_id character varying,
    title text NOT NULL,
    description text NOT NULL,
    outcome text NOT NULL,
    yes_pool numeric(10,2) DEFAULT 10000.00 NOT NULL,
    no_pool numeric(10,2) DEFAULT 10000.00 NOT NULL,
    yes_price numeric(5,4) DEFAULT 0.5000 NOT NULL,
    no_price numeric(5,4) DEFAULT 0.5000 NOT NULL,
    yes_share_pool numeric(10,2) DEFAULT 20000.00 NOT NULL,
    yes_collateral_pool numeric(10,2) DEFAULT 10000.00 NOT NULL,
    no_share_pool numeric(10,2) DEFAULT 20000.00 NOT NULL,
    no_collateral_pool numeric(10,2) DEFAULT 10000.00 NOT NULL,
    current_yes_price numeric(10,4) DEFAULT 0.5000 NOT NULL,
    current_no_price numeric(10,4) DEFAULT 0.5000 NOT NULL,
    total_volume numeric(10,2) DEFAULT 0.00 NOT NULL,
    is_live boolean DEFAULT true NOT NULL,
    resolved boolean DEFAULT false NOT NULL,
    resolved_value text,
    resolves_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    engagement numeric(5,2) DEFAULT 0.00 NOT NULL,
    market_type text DEFAULT 'standard'::text,
    market_category text DEFAULT 'general'::text,
    requires_x_api boolean DEFAULT false NOT NULL
);


ALTER TABLE public.markets OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    conversation_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: platform_fees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.platform_fees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    bet_id character varying,
    user_id character varying NOT NULL,
    amount numeric(18,9) NOT NULL,
    fee_percentage numeric(5,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.platform_fees OWNER TO neondb_owner;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.positions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    market_id character varying NOT NULL,
    "position" text NOT NULL,
    shares numeric(18,9) DEFAULT 0.000000000 NOT NULL,
    average_price numeric(18,9) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.positions OWNER TO neondb_owner;

--
-- Name: scraped_kols; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.scraped_kols (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    rank integer NOT NULL,
    username text NOT NULL,
    x_handle text,
    wins integer,
    losses integer,
    sol_gain numeric(10,2),
    usd_gain numeric(10,2),
    pnl_1d numeric(10,2),
    pnl_7d numeric(10,2),
    pnl_30d numeric(10,2),
    win_rate_1d numeric(5,2),
    win_rate_7d numeric(5,2),
    win_rate_30d numeric(5,2),
    total_trades_1d integer,
    total_trades_7d integer,
    total_trades_30d integer,
    profile_url text,
    scraped_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scraped_kols OWNER TO neondb_owner;

--
-- Name: solana_deposits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.solana_deposits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    signature text NOT NULL,
    amount numeric(18,9) NOT NULL,
    deposit_address text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    confirmations integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    confirmed_at timestamp without time zone
);


ALTER TABLE public.solana_deposits OWNER TO neondb_owner;

--
-- Name: solana_withdrawals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.solana_withdrawals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    destination_address text NOT NULL,
    amount numeric(18,9) NOT NULL,
    signature text,
    status text DEFAULT 'pending'::text NOT NULL,
    error text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    processed_at timestamp without time zone
);


ALTER TABLE public.solana_withdrawals OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_achievements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    achievement_id character varying NOT NULL,
    earned_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO neondb_owner;

--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_follows (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    follower_id character varying NOT NULL,
    following_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_follows OWNER TO neondb_owner;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    bio text,
    avatar_url text,
    total_bets integer DEFAULT 0 NOT NULL,
    total_wins integer DEFAULT 0 NOT NULL,
    total_losses integer DEFAULT 0 NOT NULL,
    total_volume numeric(18,2) DEFAULT 0.00 NOT NULL,
    profit_loss numeric(18,2) DEFAULT 0.00 NOT NULL,
    win_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    roi numeric(10,2) DEFAULT 0.00 NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    following_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text,
    wallet_address text,
    auth_provider text DEFAULT 'username'::text NOT NULL,
    is_guest boolean DEFAULT false NOT NULL,
    twitter_id text,
    twitter_handle text,
    balance numeric(10,2) DEFAULT 1000.00 NOT NULL,
    solana_deposit_address text,
    solana_balance numeric(18,9) DEFAULT 0.000000000 NOT NULL,
    total_bets integer DEFAULT 0 NOT NULL,
    total_wins integer DEFAULT 0 NOT NULL,
    total_profit numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    referrer_id character varying
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.achievements (id, name, description, icon, category, requirement, created_at) FROM stdin;
3eeaa658-3719-4a3a-baa2-5fe636e28a9c	First Bet	Place your first bet on any market	🎯	betting	{"type":"total_bets","threshold":1}	2025-10-27 00:02:21.087909
6a6f2d9b-14cf-497b-9e46-00b4862ec830	Betting Enthusiast	Place 10 bets	🔥	betting	{"type":"total_bets","threshold":10}	2025-10-27 00:02:21.111381
2cdf8eb5-05c8-4d14-935d-a30ed92a38ae	High Roller	Place 50 bets	💎	betting	{"type":"total_bets","threshold":50}	2025-10-27 00:02:21.133172
4e39a163-5f36-417d-88ae-92b176d20de9	First Win	Win your first bet	🏆	betting	{"type":"total_wins","threshold":1}	2025-10-27 00:02:21.154574
df65e61a-beb7-4055-b29f-6a11c6ae44ac	Winning Streak	Win 5 bets in a row	🔥	streak	{"type":"win_streak","threshold":5}	2025-10-27 00:02:21.175261
3911453e-8381-4456-abbd-22523f810c6c	Profitable Trader	Earn 100 PTS in total profit	💰	betting	{"type":"total_profit","threshold":100}	2025-10-27 00:02:21.196861
fe77558c-a92a-4ded-be92-e77721a6a9ac	Market Master	Earn 500 PTS in total profit	👑	betting	{"type":"total_profit","threshold":500}	2025-10-27 00:02:21.218082
27609639-747f-44b0-a043-6397c0e5779f	Volume Trader	Trade 1000 PTS total volume	📊	volume	{"type":"total_volume","threshold":1000}	2025-10-27 00:02:21.24027
45a08c89-f4c9-4d18-95c6-9fa0a8f39a04	Social Butterfly	Get 10 followers	🦋	social	{"type":"followers","threshold":10}	2025-10-27 00:02:21.260797
d2599858-8395-48c6-9462-9482b275710c	Influencer	Get 50 followers	⭐	social	{"type":"followers","threshold":50}	2025-10-27 00:02:21.282038
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activities (id, user_id, type, data, created_at) FROM stdin;
7b133f78-54d8-4eba-86d8-69e13ee843fe	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"164f4263-60e8-480c-984e-53a375ae52ed","marketId":"73209b09-1398-4562-a07b-dbdfdd7d1ec8","marketTitle":"Engagement rate will exceed 5% this week?","position":"YES","amount":50,"action":"buy"}	2025-10-27 00:50:42.007459
afd77694-80e0-4886-a59c-ae60602876e9	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"164f4263-60e8-480c-984e-53a375ae52ed","marketId":"73209b09-1398-4562-a07b-dbdfdd7d1ec8","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 01:28:47.842889
e6f366a2-4783-4b5c-a234-fbb7a764d2ab	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"09fcdeef-84aa-452e-b3fd-5a6638e400b4","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-27 02:06:53.28606
b3cdb755-1cac-4854-bc06-f694c1882498	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"cf2ed0f4-f81d-4487-9ee1-d63750097392","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-27 02:07:01.985373
d86c2c67-8d57-4787-a236-aeba43309f52	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"d66a0757-5960-4b2f-a643-403475966ed5","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:06.509561
b7b9b20a-2e98-4596-bdb4-4486be1d118c	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"7e6f1432-a52d-42b6-897e-875087d8eab7","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:11.489377
6e8156f5-c3a2-4a9c-84d2-9cf58ce67679	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"51e020b0-ce33-4199-9393-d36ab4f47c09","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:15.470969
6729b416-2870-442f-ab5e-dce733943cc6	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"0a90ef78-1da2-472a-8163-bfc6d3250f7e","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:22.262705
ebe798ee-e284-44b1-b472-fa8daa91d37f	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"7bd99def-ba95-404b-897a-c1ef54ff9539","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:31.595724
05826017-539f-4f62-af0f-66fa26989dc1	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"8ea9f723-1cb2-4291-864a-4bd2d92f873f","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:37.781905
25ab031e-39af-4677-b6e6-1b9a6121a8f1	2a5a8384-d652-42e3-bed1-b03545d35725	new_bet	{"betId":"13e13539-49e5-48a6-b0f7-aa7a1ce35d82","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","marketTitle":"Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-27 02:07:46.297352
3f12746f-63c7-4163-bd49-4f956dfc81d6	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"09fcdeef-84aa-452e-b3fd-5a6638e400b4","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":500,"profit":"-500.00","payout":"0.00"}	2025-10-27 02:25:44.95274
9c303224-8ee5-459d-8b3d-b0a1d9cdc791	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"cf2ed0f4-f81d-4487-9ee1-d63750097392","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":100,"profit":"-100.00","payout":"0.00"}	2025-10-27 02:25:44.95274
d032a0a3-b07f-44d9-ab12-93fcbea5263e	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"d66a0757-5960-4b2f-a643-403475966ed5","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
8cb8e283-8a8a-4cd0-8b4f-975323a8b4ab	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"7e6f1432-a52d-42b6-897e-875087d8eab7","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
ddb003e4-37cb-44ad-9ee5-715988fc8856	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"51e020b0-ce33-4199-9393-d36ab4f47c09","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
22ce0bf3-d076-4d80-9e6e-51547b6a88cb	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"0a90ef78-1da2-472a-8163-bfc6d3250f7e","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
426602ee-c337-46ef-b1c2-227ce2136fc5	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"7bd99def-ba95-404b-897a-c1ef54ff9539","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
d63184e0-dddf-49e8-93c1-0e1eacdc3107	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"8ea9f723-1cb2-4291-864a-4bd2d92f873f","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
9b6a4481-ee87-4db0-9c31-714503039e36	2a5a8384-d652-42e3-bed1-b03545d35725	bet_lost	{"betId":"13e13539-49e5-48a6-b0f7-aa7a1ce35d82","marketId":"c9eb1e87-a44c-484f-8e64-8aadee6c06bf","position":"YES","amount":50,"profit":"-50.00","payout":"0.00"}	2025-10-27 02:25:44.95274
39175e3b-47df-4641-8c67-8c07af843f94	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	followed_user	{"followingId":"2a5a8384-d652-42e3-bed1-b03545d35725"}	2025-10-27 15:48:03.367262
d8a3a33e-4a67-4fab-bf42-e40aa9faced6	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	new_bet	{"betId":"7293a639-9b2c-4ec1-a07a-754797540ad4","marketId":"9eddb4ed-8e10-48e7-abf3-3621f24319bb","marketTitle":"Will Sheep maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-27 15:49:33.86024
af28c72b-d1bb-4bd4-a8b3-ea7eedb5f68f	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	bet_lost	{"betId":"7293a639-9b2c-4ec1-a07a-754797540ad4","marketId":"9eddb4ed-8e10-48e7-abf3-3621f24319bb","position":"YES","amount":500,"profit":"-500.00","payout":"0.00"}	2025-10-27 15:49:33.827703
9bbe58b4-3220-4ec7-94b5-329b8e51e5d6	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	new_bet	{"betId":"74d28bc2-315b-45d4-9a50-c2a63f252893","marketId":"11e1fe6c-07dc-4463-a338-de6f7bab83aa","marketTitle":"Will BIGWARZ reach rank #5 or better by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-27 15:56:24.029683
f6a514c8-7963-43c4-bcb0-0c64b8ec024c	72e306d2-207c-462c-9415-a0c7aa96a2ab	new_bet	{"betId":"ae0a109f-ef73-4b1b-8129-13c5760001ca","marketId":"f934ac20-c4c3-4fb1-8c54-35ea539f7cad","marketTitle":"Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-27 16:26:30.529843
87d72636-2b62-4b57-a58b-b1263d247b8f	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	new_bet	{"betId":"4c774a50-8a22-43cb-8d29-2cd9509af935","marketId":"f934ac20-c4c3-4fb1-8c54-35ea539f7cad","marketTitle":"Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-27 16:26:46.132089
86967998-d31d-4ca2-9b2c-ac8a62cc0ca1	72e306d2-207c-462c-9415-a0c7aa96a2ab	new_bet	{"betId":"8736a822-592d-4cfb-a3ab-b0cf6da03ccc","marketId":"f934ac20-c4c3-4fb1-8c54-35ea539f7cad","marketTitle":"Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-27 16:27:04.252408
9cdcac56-e446-4e81-a32a-9f84493f8977	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	new_bet	{"betId":"14ecf6d9-6e06-4f5c-9da7-8d8a73a7d7fd","marketId":"f934ac20-c4c3-4fb1-8c54-35ea539f7cad","marketTitle":"Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-27 16:27:29.709417
5c53350f-1c58-44fe-abf2-46ca508ee32b	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	new_bet	{"betId":"bb068e2a-968c-486f-98d2-450c12d1e615","marketId":"f934ac20-c4c3-4fb1-8c54-35ea539f7cad","marketTitle":"Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-27 16:27:37.425201
bcf9f95a-d8ec-458c-9f8b-7cd00b9fc8fc	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	bet_lost	{"betId":"74d28bc2-315b-45d4-9a50-c2a63f252893","marketId":"11e1fe6c-07dc-4463-a338-de6f7bab83aa","position":"YES","amount":500,"profit":"-500.00","payout":"0.00"}	2025-10-28 23:02:23.231217
4d6ab383-c96c-4657-b866-f25b6333a830	9834faee-2e62-43c4-8bdf-e8a48c024bd0	new_bet	{"betId":"4183c641-1193-476c-a1cc-7320f9ac26aa","marketId":"621f98b0-89ea-49de-8d53-e80a7df36042","marketTitle":"Will h14 have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:13:26.358584
753ab4fd-01fb-42c9-b703-ac9197ad896f	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	new_bet	{"betId":"f93336c0-2606-4a34-b905-f64a7d20de31","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:14:17.201093
828dd88d-4ad0-4fd2-bf5e-14859722fe20	d8c125df-fb1f-4755-9975-1e23ffdd006a	new_bet	{"betId":"76e41b06-001a-410b-9472-591df2d43e30","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 00:15:27.702766
0cb472fe-1cf5-4154-af12-e4d4471ec014	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"7db9054d-57f0-4a05-883e-36af38cf54f3","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 00:31:21.61096
7697eb50-8ab5-472b-b2bd-37e31e6a547e	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"9f3dae7d-2b63-4e33-9b9c-381fbe797f53","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:31:45.267478
05315af3-eace-4598-b33d-2c9ad27872eb	2cebf2a9-8cd9-41e2-8a76-357570839646	new_bet	{"betId":"cf689ca2-23d1-473c-ad8b-e3b4a3710ff2","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"NO","amount":10,"action":"buy"}	2025-10-29 00:32:42.179473
dd0ce81f-1187-4baa-8735-6f0f6ab978bc	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"d5e851c4-3a8e-4a3c-b3cf-ddcb539edff3","marketId":"0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4","marketTitle":"Will Pain reach rank #14 or better by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:32:43.723432
00af6820-a9df-40a7-a113-e14fabe93e15	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"184e7eee-7f33-4a51-a4af-98291b48e049","marketId":"af62438b-0dfd-4b7e-921a-c65249b9514b","marketTitle":"Will Heyitsyolo record a win on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 00:33:18.944251
09adce8a-d1fd-43ad-9194-77139a6018e2	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"45f2874b-6e47-42e0-8e1f-972dcee52b19","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 00:33:27.867158
37c9f2d9-56d2-411b-94bf-5f424135addb	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"66130f1f-0013-4b4d-a4e6-4c78a970c350","marketId":"ef4592dd-1cc6-4da6-80ad-c185d04b83e8","marketTitle":"Will West maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:33:42.381695
63fb2400-6209-413a-9bb3-d94bb0a08df2	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"02dfabd4-1f21-468b-9ef2-466d4db9d4f1","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 00:36:51.705909
dacc079c-9c43-4db9-8399-4b1295f8fb44	8903720d-1010-4477-a548-0fa98558c462	new_bet	{"betId":"30e7eddd-479d-4efe-bba0-0b2cfd510783","marketId":"0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4","marketTitle":"Will Pain reach rank #14 or better by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:37:07.288862
b4b45521-7373-458e-b752-02eb93d80acb	c694679a-47f2-416e-8e5f-34735fba5715	new_bet	{"betId":"468e49c8-36f6-40b6-b014-7cf729ad66c1","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 00:43:09.044775
e18c32ae-3b0d-47b1-abdc-03c13c52458a	c694679a-47f2-416e-8e5f-34735fba5715	new_bet	{"betId":"0df957cf-b0f9-4f8e-89a6-970dee892014","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 00:43:40.644936
bb4c422c-5176-45c2-b5fb-f75ee92c009f	c694679a-47f2-416e-8e5f-34735fba5715	new_bet	{"betId":"e5ff9495-d210-437b-8527-084c4b892843","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 00:43:51.487079
b360c41a-6efd-4363-9b08-1a1269286ff2	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	new_bet	{"betId":"982df626-cc04-4f81-87af-969aa9c1c250","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 00:45:04.871194
553006a8-a628-4006-87a2-2bcb2a7bc785	47887516-721e-4369-9fb0-918c63bb8227	new_bet	{"betId":"21c10581-7a74-4ca8-91ee-5dae7c0b5612","marketId":"696b7e3f-44bb-408f-b490-482f4fb7bcc2","marketTitle":"Will Trenchman gain +50 SOL or more by tomorrow?","position":"NO","amount":999,"action":"buy"}	2025-10-29 00:52:13.95092
50ecf722-922e-4c49-a180-698bac48fb15	4a6a595c-f247-4f53-a589-e606cc428bc1	new_bet	{"betId":"9a0b792b-3208-40fa-be4d-e8b6a4a73f5d","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 00:56:47.432451
bd7bba4b-1483-431a-853c-f47e3458fc7d	769a0aa2-9ce2-4a09-8efb-697727a78239	new_bet	{"betId":"d5f3bdb5-ce9d-43ff-a82e-df5f339edd45","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 00:59:34.499
1a539fd1-4a94-4f89-8145-23efc1141742	4a6a595c-f247-4f53-a589-e606cc428bc1	new_bet	{"betId":"5a2cde4b-e988-4d4d-a110-b5cc8d39d39b","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 01:04:16.106679
6d66f672-029f-4f6d-9bef-b612f74caa55	088deaa4-8a69-4d01-ac4c-a00a67444efc	new_bet	{"betId":"2ab1a2cb-dace-4947-8aa7-26f6684fc89e","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 01:05:47.326794
a9cd9513-6ca0-43f2-b520-ec38b73c2b44	30505fa7-dbbb-45c9-b704-5498b6ce730d	new_bet	{"betId":"77f2da9b-9eeb-410b-a966-8f8b7528e784","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 01:12:22.179549
9191a795-208a-4e9a-8ac5-e0dabad3144f	01289b67-bc83-469e-99a1-356102efe0fd	new_bet	{"betId":"ce0b41a6-6bb2-4179-9268-f2bf7dfb1a04","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 01:17:16.356182
d1bd913f-b4b9-4380-816f-5dfaab9fbe2e	ce45f9ea-0146-431f-9469-15e31de21981	new_bet	{"betId":"be08e159-2663-4040-be73-8f132d294aad","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 01:37:15.930718
c6b63696-95d5-4731-8565-16ec1245683e	aec40e30-e922-4f47-8552-c07c08a12e9a	new_bet	{"betId":"265a6e8a-874e-459b-8141-c9105d34e9cf","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 01:37:23.284431
4acbe249-1431-40a9-bff8-173fb2336a4b	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	new_bet	{"betId":"a80f4c0e-2855-4cf8-8a28-f93c14c17c25","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 01:38:38.766998
f283f7be-1b7e-47fe-b6b7-f6cf5fcb5d7e	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	new_bet	{"betId":"e94637d6-62d9-49a4-a067-0312464693f4","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":990,"action":"buy"}	2025-10-29 01:38:53.604297
f3884c85-03c0-4dd9-8f0a-baf3c7967738	b03668e6-821a-4e06-b541-1cd2e0ea45af	new_bet	{"betId":"5ea40eb5-e7c3-4313-b7f5-15b628c6a393","marketId":"d34373d6-1998-4d30-ad8b-86693941de64","marketTitle":"Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:41:46.326322
7e576037-97d8-4be5-861c-b492c77de641	7f0a9138-5a4d-4955-8895-dc27436f10b2	new_bet	{"betId":"e6501650-aad9-41af-8900-21983cc84cd9","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 01:44:09.187876
486329f9-0b11-442a-9f8d-1faad33def91	00772767-41bc-4967-8266-5541d53b105e	new_bet	{"betId":"1bc1c10d-73d9-4909-ba53-2b54fc5ff2d1","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1000,"action":"buy"}	2025-10-29 01:47:44.854452
ad27eca1-6fd4-42df-9c73-da92eceae51e	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"3db00ddc-2097-40f0-989f-85aa974ef28a","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:48:29.848246
e0367bac-01fc-429d-b7fd-5033a088f82b	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"24e141a5-3c46-439d-8ede-3cf47feb03eb","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:48:44.932782
bcd9d18b-1054-4476-a62d-7c4174a2b5a8	bdefc13e-f3e5-49a2-b749-4aa864027d42	new_bet	{"betId":"9b923e82-d192-48c2-8c91-389505b3900a","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 01:48:49.054498
cec895cd-afd9-493a-9a6f-9ef3c42adb0b	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"4ddab040-2bf0-44ae-b8cf-ba8ddd3258d5","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 01:48:54.825292
b12f08f6-c116-4baf-89ba-b7daa418c6b1	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"200b93a4-5d1e-429e-a5c1-e8f4855333c4","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:49:06.997802
ddf0773c-550c-473a-9d61-fc739890779d	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"6bec6ec1-097c-4e54-90de-dafa96a59472","marketId":"e6ce6e2c-77ed-4fd4-9687-23b604290619","marketTitle":"Will kitty rank higher than Cented on tomorrow's kolscan.io leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:49:14.481484
5387919a-dae7-4270-bf6a-16e2d9c6fc3b	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"f6904d6a-c3bd-4e89-8cff-9c9279c99594","marketId":"621f98b0-89ea-49de-8d53-e80a7df36042","marketTitle":"Will h14 have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:49:20.779037
ed66a3a5-d6b8-481a-8226-aa856e06cd46	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"6fd90942-7d28-4f20-9c3b-20f1ad89864f","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":97.05,"action":"sell"}	2025-10-29 01:49:55.318762
c3e52f0f-e439-4c47-b054-86016b85be5d	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"5fbc4b0c-6d44-4297-895a-24bde281a532","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":480.6,"action":"sell"}	2025-10-29 01:50:05.753866
5a89f0cc-50b2-4b71-8bd1-7471fabfab75	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"cbe97e85-e7ae-4efd-abe0-fced10679d38","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":97.52,"action":"sell"}	2025-10-29 01:51:07.340936
ebe150ab-ff34-4c5b-9fcd-474d19b21e0b	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"14bdb097-6d24-4a45-98e7-4214cf67c575","marketId":"e6ce6e2c-77ed-4fd4-9687-23b604290619","marketTitle":"Will kitty rank higher than Cented on tomorrow's kolscan.io leaderboard?","position":"YES","amount":97.52,"action":"sell"}	2025-10-29 01:51:21.331404
2a537f72-81ed-4113-8de4-46be7ed9d708	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"d7a17e32-5320-4004-ae46-ef4225aabcfd","marketId":"621f98b0-89ea-49de-8d53-e80a7df36042","marketTitle":"Will h14 have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":96.58,"action":"sell"}	2025-10-29 01:51:27.603971
f8712a10-cbfe-46c3-a97b-4379fe78f772	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"6cae2c81-6066-4779-bd0d-57269475014d","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":97.43,"action":"sell"}	2025-10-29 01:52:16.155684
d930e07e-43c4-4cdd-b344-882d3a1da1a6	5cdda325-1f54-42bc-b1d1-7479913fc3f5	new_bet	{"betId":"7d58709f-3dd5-4684-9e79-0feb39144791","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:51:48.218806
77a3c24b-cd55-4459-a65f-c42ff4714537	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"580944f6-07c8-4961-b217-370f5ffee905","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":882,"action":"buy"}	2025-10-29 01:52:04.480436
9a3d8cea-20ec-43b8-8c79-f030ba6cce38	d6f78f80-b222-49b8-9412-eea692bcaa34	new_bet	{"betId":"0adeb93a-44ec-4cff-a1d8-ca786d23ba6b","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 02:18:18.797506
c6c958cd-dcba-49e6-a86f-cb57fe095f2c	0238327d-15b3-41ae-b52c-cf223ee9832c	new_bet	{"betId":"48eae729-dd9c-4bd5-8552-7bc8477cacc4","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":98,"action":"buy"}	2025-10-29 01:52:39.118971
5d9cccd5-1210-4372-9902-d09b7f3350a9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"26396821-12d4-4b9e-8964-9c524d724cae","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:38.575933
810d4e96-c75b-4905-9503-37448ddc1e31	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"ab87b012-346d-4db7-a7c6-fb0234fb261e","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:50.074926
5da7425c-1f3d-4165-aa1e-3dc929b1ebac	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"f0792a47-49f6-4b16-b992-84c2d8cf833b","marketId":"76909b2b-a9dd-41e2-a424-b01cdd5d2b8b","marketTitle":"Will Jidn maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:19.587098
5f91b658-f617-4a5f-9389-8666bd6e67fc	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"6c63aa74-6a45-44ce-9ace-2c50b3a7298e","marketId":"e2671622-4131-4733-8176-eb9c27780278","marketTitle":"Will Kev maintain a win/loss ratio above 2.00 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:19.924594
ec2ca04e-74e7-43ad-8e92-d9574c7d7110	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"f308bddb-80fb-4206-b8b8-499ce848c8b3","marketId":"91c019e2-7233-495a-988a-8d4c7cdccd2b","marketTitle":"Will Sheep have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:29.362797
e5540bb6-1c8b-406f-a6b2-b9684fb51d67	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"5729296b-81fb-4de5-a697-eb445ddf4943","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 01:56:01.467872
a6178ab4-1b86-43c0-a0cf-274e6c4f25b5	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	new_bet	{"betId":"a923f01c-228e-401a-b33c-92c5eb05cbc5","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:28:20.670188
b402418f-561d-4a7a-9f40-05551f7e82f2	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	new_bet	{"betId":"66bc3c48-0a2e-481d-968b-1073684deeb1","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:31:48.027622
1775ec7d-ffea-43ce-8b6f-c19ddd52824b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"cb1eab04-71db-4acc-989b-3c4fb00d84af","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:18.601087
ec375920-54b0-4a50-96f3-6c8d9c237dc5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"a5bd61e1-c40e-4b2d-8fad-b008eecc6097","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:37.024459
1c1a7924-f1fc-45f9-85d3-58a144acb27b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"8c234e5e-b990-4a7e-bbe4-6b0040f336b4","marketId":"5877484f-f8a2-41b8-8889-7bac69f1c993","marketTitle":"Will ozark have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:55.666821
0c1217d4-8f42-4ca3-824c-afa8bd7ddf7f	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"42299002-f4e6-4165-afe0-eece4255e5f7","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:56:21.825012
550b02ab-3b4c-4a71-a860-fe60a38a6635	d3e4a456-7bbd-461c-8806-50dee853d118	new_bet	{"betId":"81792d36-f986-4298-9532-aa7abf64acb6","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:31:20.774895
68d8d1ce-680d-41aa-a503-d98f25adca4b	898e8852-e40d-4b2a-a8f7-3e215268febc	new_bet	{"betId":"aececbe4-4255-42ce-917e-6e63500ca7e4","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 01:57:52.706718
9033539e-5a47-480a-bf4a-0c4fe2112379	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	new_bet	{"betId":"df4f45b4-0952-460e-88c5-60dbb103b6dc","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:04:20.829857
1b46ea5c-6b3a-4ed0-b945-43ba45ac2d07	b03668e6-821a-4e06-b541-1cd2e0ea45af	new_bet	{"betId":"09fe1c65-aaa8-4d9a-bb8d-bf35d35c2011","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 01:58:20.529024
f7c082df-03d0-4ef1-bd1d-b19567091f43	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	new_bet	{"betId":"e7eb7aac-6cae-4a11-87e9-a63b9cd6dcf6","marketId":"f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0","marketTitle":"Will Cooker gain +50 SOL or more by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:05:41.987331
727a25d0-2281-4eed-bbe3-b15c7241e3f3	411dc4b0-c7f6-44ba-a7cd-dab215760984	new_bet	{"betId":"e2a4153c-90cb-494b-9b8b-f5984d9efca0","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:12:46.472348
f3501708-17a7-4a5b-b254-7eecb2940f80	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	new_bet	{"betId":"92cc4860-4254-4042-b0ea-c2fe279316d9","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:15:40.457423
d26e68bb-2b33-4a6c-99b5-57c4c0e18aae	d6f78f80-b222-49b8-9412-eea692bcaa34	new_bet	{"betId":"427971a8-c840-43dd-be77-0441550ddc5a","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 02:17:37.642042
872a2010-44b8-450e-be13-3589580d73cf	d6f78f80-b222-49b8-9412-eea692bcaa34	new_bet	{"betId":"1d587a4e-b012-453a-af1e-9e5d6d62ca5f","marketId":"d5812241-a74a-4d80-81d3-eab0c8af3b5b","marketTitle":"Will Unknown maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":450,"action":"buy"}	2025-10-29 02:18:38.393981
c9846a23-6fc6-4deb-be2f-9acc64431b07	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"f6e7022f-f6f6-41dd-b13f-41df29e1d7b6","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"NO","amount":10,"action":"buy"}	2025-10-29 02:30:39.864252
78d68d02-ddf6-4027-8c59-d0fda5287800	37ed79db-51d0-4907-aa94-75502fa74c5e	new_bet	{"betId":"b0bf4611-c653-42dc-89ec-54388d211e3a","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:32:52.763959
efe2e470-3409-4fe7-a9a3-e897ad49b70b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"418a08ea-f48d-400a-b968-a25d2c2f6695","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:37:45.090707
c0859275-ba9c-44be-965f-41b329b014cf	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"709e8403-6c96-4a02-a9fe-623e74f27f64","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:37:53.434665
e63fdd5b-98fe-4ece-9928-a54864490281	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"543d5233-2da3-45c0-bf32-5cd70efc4b02","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:38:01.849577
0f04adc8-cac5-4719-9dea-a96203cbd478	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"9b87ab09-8af1-4823-9b5c-0f0f296bf2c2","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:08.533759
ebff0239-5654-47ca-9a4a-cd809b149525	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"92019caf-10a4-473d-a60e-8fc9a589da36","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:13.041158
615f643c-6e0a-4ca5-8e8f-ea43b1f04349	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"e370b63b-bb18-4d7c-bab6-ba678f819dbf","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:23.115604
8d984e40-f540-4047-998e-6167f987207e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"06f88a9a-c6db-4d6e-b651-2888684a958b","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:30.701072
3019302c-ba50-496b-8046-e67097bc3eaf	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"270c0bc8-f124-4171-b949-53129dded070","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 02:38:32.153522
671edecd-5562-408a-bff0-7e8f9ed7a51c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"9e574d3f-5383-43cc-a964-37b2a290085c","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:43.529076
1e8af9df-f216-4b12-8fa0-95a52bb1db3c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"70af32f4-b20c-49e3-8849-f3e575b13308","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:38:43.835853
bed02cd2-e4c4-463c-a47f-78d25cf41133	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"4beb140b-6fb5-4748-a345-b05fb0f318f9","marketId":"ce750e89-ae58-40aa-8b69-ef078c54aff4","marketTitle":"Will oscar reach rank #13 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:02.831579
14d20a25-8e04-4fac-af5a-beb291c72e15	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"638ec9cd-8ed2-4868-8c97-50345461c876","marketId":"ad076954-b6fe-487f-aa79-8c2cbfdb62e4","marketTitle":"Will aloh record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:07.265322
e51ab3ef-0594-4199-ab26-b3a16e6ed305	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"a57bdd59-ff7f-40ae-9a2e-67bd9b935ddd","marketId":"6018a059-bdde-4605-8636-8c8ab7fadd6e","marketTitle":"Will Kadenox reach rank #13 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:29.797981
fc01a48b-da66-490d-a828-b04dfa095124	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"d00d5715-4842-47fa-8815-419999f93602","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:39:06.30766
90b4715b-4a2b-4773-a92f-c71e68ad9900	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"dd3fd94c-10d9-479f-96c4-d2cea98d54ba","marketId":"34c43b93-174a-4546-9ad6-97bde99d37dc","marketTitle":"Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:26.744569
0e268131-c276-43d2-a215-dabf4e606453	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"9479e942-6679-453d-80be-b5a426c5a50e","marketId":"20250d49-1b4b-4096-a17c-6a6de8e21747","marketTitle":"Will lucas record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:34.298842
8f1d4d45-1e02-43d8-9466-bbcc3ad31063	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"1fdc03e3-f216-494d-836c-6cac8a8df047","marketId":"ae59057f-cbc0-4ee4-b623-257f78296ba4","marketTitle":"Will rayan rank higher than Pandora on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:39:41.579881
b4cd4db8-3b5c-4fc8-8854-023a4627dd2f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"83141eeb-8985-4e1c-8cc9-3680fc86f6e5","marketId":"ef4592dd-1cc6-4da6-80ad-c185d04b83e8","marketTitle":"Will West maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:39:56.295107
8124a3e4-2a52-40a9-862a-62dbb45be35d	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"0a72981d-a0d0-41f2-a66c-a0c9ab9f57f0","marketId":"696b7e3f-44bb-408f-b490-482f4fb7bcc2","marketTitle":"Will Trenchman gain +50 SOL or more by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:14.728467
dba7ee74-ade4-49ef-b402-aec72d587a43	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"619c550f-b946-4b8e-a079-981763ab61c2","marketId":"d34373d6-1998-4d30-ad8b-86693941de64","marketTitle":"Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:15.253555
a70f195a-8ebc-4a1a-abd8-8b5a5482e7bc	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"534d35da-0794-47d2-8b2d-944ae3a09259","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 02:40:26.676623
d18e2392-f86d-4a2d-a16d-2d9813f149dc	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"c6674308-1f38-48f2-afa4-27476a4a7d04","marketId":"0ae16313-0efe-4dd3-bc92-ca8bf2246903","marketTitle":"mog to gain +15 SOL","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:39.325012
754cca85-cd12-4c11-a4ec-f413475fdae9	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"7ea2d203-1385-4822-8d75-73654e81ad83","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:40:39.682724
26ca2ca7-c357-4af3-9175-89cb95f26778	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"43d8ed5a-b7cb-45b7-bcfe-dc8fa4ad4fe3","marketId":"34a0781e-cde7-4eec-ac89-fdad71893214","marketTitle":"para to gain +15 SOL","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:43.765104
9a81c50a-1343-4ce6-b236-1757d9404e4c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"ed4350b2-7e0e-4fc9-8337-7d93791edecc","marketId":"5b4c6405-94b6-4e20-a87b-c5ec6256786f","marketTitle":"jester to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:40:44.040961
3ed1cfa7-bab1-45ee-aa3e-16a7afcb76c0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"81acfc82-96f1-465f-b829-0426899066c0","marketId":"e1564a37-b27e-4380-a2b2-8054ff5ac4e3","marketTitle":"blixze ♱ to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:40:50.084659
032ea608-91bc-437e-a888-36574178ee0f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"e654d106-cf33-4e3e-9b51-2aff47ba260d","marketId":"15fef1cb-7d54-4348-9005-4512771e0ba1","marketTitle":"Rev to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:40:50.328794
50c7c9d9-28a3-4a66-b406-05fee1adf416	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"a1d703a3-86ad-40d5-ba51-cde9265a58cd","marketId":"6e5fd4b5-651b-482b-a6b9-36f7cdf769ba","marketTitle":"Ethan Prosper to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:40:50.866546
71a3eeca-124c-4d77-b16e-79d9c41f13d4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"edc93077-ae1b-4f23-b758-7012409b0b9c","marketId":"962fec63-4816-4bbb-9970-3f002fb86e02","marketTitle":"Veloce to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:40:51.170524
770ece6a-73cd-4554-a74d-681fce97ad0a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"874e357d-282b-4529-923e-0c89e2802e07","marketId":"7a6658de-1c31-445c-90e0-370fc3977773","marketTitle":"Cented to gain +15 SOL","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:55.911745
e0eef13a-3808-472c-9144-deae0363cfeb	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"21274a85-a791-4891-ab61-f33708f35b07","marketId":"18b3c5bd-541a-4ab9-bb77-a92510f6808a","marketTitle":"N’o to gain +20 SOL","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:40:56.180014
e6e35470-922f-452b-a2c6-9577130fc459	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"012ef30b-f38f-4db3-99b9-db1d000593a1","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:41:23.926437
26e2ce3a-75de-4722-8cef-f00a43946faf	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"0b270dda-b5d4-4080-8d17-6c550aab24e2","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:41:26.879392
d3925893-47a8-4333-8494-acbfa8e82ed1	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"33a51963-cccd-4037-959e-e5ffe2297a74","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:41:39.939541
96cebc81-69f9-4760-b23c-074ed023516c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"33297b17-a4bb-40ae-b702-5c4a626861d9","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:41:55.077534
c7caad03-ef1f-4a10-91f3-0006700d8a4a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"1e5448fb-f964-40cc-bb48-dae541a256da","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:41:55.294024
81e595d7-8fe1-479f-8eef-3d91a013030f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"6b4bbd90-b7aa-4c25-98f4-8063be6b4086","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:41:56.404009
23ccf144-8f69-44d4-8de4-f9ab99bde917	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"5160d71e-9cdc-440f-9e29-5808b8f7e160","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:41:58.464594
95f58083-4371-4675-87b7-7402a9790205	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"bdcfa728-7126-4847-8bf7-cd008795c9d4","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:02.667875
ede307bc-eb78-42dc-b201-8111d29242f3	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"dacb116c-63ee-4dbd-a050-8d81497b5d7e","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:42:56.980621
0d837369-bb13-46fd-8860-daa159f8b27d	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"a9ab8eb5-ffb5-4ff6-a7e2-04bde22cde6a","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:43:08.683029
7762f053-5c3e-4ddd-81d9-1cdb21ca1a1c	898e8852-e40d-4b2a-a8f7-3e215268febc	new_bet	{"betId":"c11459e6-e93b-4d4e-8164-c391483bc8e6","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"NO","amount":100,"action":"buy"}	2025-10-29 02:43:35.216247
b7dbb874-4c10-471e-9f49-54e8eaf01cb2	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"caf04a91-ee81-466e-bc46-4d9ad0c2876c","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 02:44:08.470943
82284b22-15ce-4567-abe4-05b5b213d8fd	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"a67cc0f5-a4fc-4d3b-bbc2-050380d51f4d","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:44:39.137656
33b20fd1-a3f0-4ad0-9798-cdd47da54281	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"fadb28e0-297a-4dd3-b157-eff8ac3b2596","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"NO","amount":10,"action":"buy"}	2025-10-29 02:45:08.046653
cfa9500c-e925-4b72-9706-29cc5297caae	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"b7da1153-f007-4096-af20-8d75c34ca24a","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:26.204063
87c800a5-df54-4ef8-aeac-e9f1efa499c6	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"9b7afacb-98d6-4ae8-9f23-68888ebf9d7b","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:17.330114
af632ed0-14c5-4249-81ef-4648b330ce83	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"8dc79b74-50ed-43dd-bcba-082a2d89b33f","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":50,"action":"buy"}	2025-10-29 02:42:08.093653
e60dfede-77f5-4288-9b47-159586d3f315	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"d09f52a5-17ac-4845-9df7-4134d18d822b","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:09.054915
2e6ec25e-d9e0-4e87-b5a8-d49fe52f308c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"5df6eeb8-440c-4b22-a2ac-edc117e5e55b","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:18.352535
a6e9aa87-e95a-40d5-ad25-39aaaaeec953	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"6c88a150-30c7-4c43-a0d0-90e27d87418f","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:23.092189
e07d010a-8c05-4dfc-96ac-e17d6c0a57b4	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"2f2b7d56-1cae-4905-8fa7-f380566db533","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:42:33.648783
33b1cf68-9b59-41d6-b597-a367603e4422	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"e26d58e1-5211-41b8-b706-ab41a8120213","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:43:09.747732
6db26ad5-25a6-4adf-9e2f-e2299a48d548	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"705c9c47-463a-4cd8-8082-b16c899140aa","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:43:26.36302
840f0926-bdd7-4d0d-aa0e-cde08470b0ba	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"7876f556-076a-4d06-a98d-020de245b06c","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:43:43.379243
aa7b22a2-e582-4fb8-85ca-5f4c3189b807	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"22afcc53-be27-4232-be89-5c0f09725ea1","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:43:46.30802
416b16a0-72d6-4de1-acc1-aecaed1fe908	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"037f1b17-40c8-4e7f-9e91-03575a9007bc","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":9,"action":"sell"}	2025-10-29 02:46:44.995782
e742be8b-fa9b-4707-8f90-384c5b94cc26	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"18226049-2e8b-4cdf-b2e2-ec15b53976bc","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:46:48.00639
10d9a8be-4da0-4cf9-85f5-0505979ba948	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"c7cd54ff-233a-4273-9aac-09d719d5a4a8","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:31.758753
b8191181-292a-4eae-8234-5f10ca43d7d1	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"4d435b05-e9c2-475c-82cd-090503e0842c","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:47:37.629492
cd4f45cc-4eb5-4aa6-93d0-ba5f1b76068b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"f4efb4bb-ae1a-4191-b0d7-04524f767728","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:38.688615
29111802-a961-4439-922e-490254bcaa2f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"38616763-6897-4244-9843-af2209e7a631","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:44.763991
2e1a1c76-3889-40c5-8c1e-ca991b9e8b5c	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"8291e395-ab4e-41f5-9549-173d0bd4149f","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:48:43.755649
fb13883e-254d-4a37-94f7-329f0141195d	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"ce15857a-0b3e-4af5-899f-270f27e7e1f4","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:48:49.410478
37c12750-ba5a-4124-b686-8008ec5f5a27	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"a198cfc0-5d14-473a-be11-ffe8518d9e24","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:48:51.053431
718d9d7a-2892-435e-9650-addbddb829d2	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"45a7afc8-526c-4c06-8a2d-418afad927d1","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:02.489066
e3a54239-4279-4318-b255-3bbdf397e794	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"de811dff-4957-45b0-bc24-9df5168dde0d","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:03.698288
d9c52b03-593c-401f-a0c9-1030e4dbdb91	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"699e7e59-e484-4ffa-81f6-1a6046a7b173","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:06.288977
bc32c98e-f97b-4a39-8493-990dd9ad1c89	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"c3802933-7041-4d7b-96d8-d64d54803aaf","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:08.261119
cc50b548-83e1-451c-abfc-adfc3b24698a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"0fc60ad4-26f2-442e-beaa-995b75c6f53a","marketId":"d827611b-bd78-4f00-a05c-b68859aefca5","marketTitle":"Will Files rank higher than clukz on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:24.502525
f65fb41a-bbd8-4976-884b-4922fb431441	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"621d6f34-8fa6-4986-bded-a400c24bcfd2","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:32.329075
a5b1cf7f-8b55-4993-83e8-722995781280	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"82840296-512b-490b-97b6-a4f8925e9308","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:32.677842
9394341a-4d66-4864-aaeb-771179cb75b9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"c8af9b86-63d7-4e8d-8834-777d4fab404e","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:42:34.681483
0e88bbca-75ba-4fba-b8c0-596696123b78	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"8610ad02-02e2-43fb-9a12-5e1ac6eaba23","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:43:09.365223
6b5066c7-a866-4675-879d-f1c72955d126	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"40bb18f4-8fe6-412a-b7eb-bc08a05bda36","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:47:28.853735
c6fceb9d-83bf-4add-bca8-2e3e342bab4a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"06ff8b04-945b-4e46-8c8c-659dbe5f1777","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:48:56.21874
a39c013b-cc9d-4d2d-9e9d-bc0171a8af97	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"d5c7f913-730f-43d3-87c6-33993d251ad3","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:10.316895
94c811e0-78f1-4323-abd3-362cb9d34361	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"bb75857d-b2ae-44b0-a3c0-e2b7b9cc4b78","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:14.628212
98d0d805-cc12-4b57-94bc-105e823fa92b	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"a9e7bbcf-ab6e-45d8-974c-746c3cb79980","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:43:19.24468
af8a35dc-8c78-4218-a690-cc2670122dbc	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"4c5b0f57-202e-472e-b325-290d7aac880d","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 02:43:55.259627
73a4eb77-b828-4e1e-8b15-793fd243ef4b	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"f743bd2a-02b8-4dac-a1f8-fef9df7dd309","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:44:45.774305
ab731acb-4196-4c02-87f6-711a1aa1b43a	e5275105-2102-4d2c-afda-0440b7afaab3	new_bet	{"betId":"f7eb5cfe-4d78-462a-af12-fc1178de3357","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":20,"action":"buy"}	2025-10-29 02:45:22.65676
aa0ef103-c533-4212-87b8-155dd7fa01ab	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"37d22865-8fda-421b-beb4-ee0537681969","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:46:24.682935
9372e15d-0372-4dbb-9b7e-9d314a2fd348	898e8852-e40d-4b2a-a8f7-3e215268febc	new_bet	{"betId":"5d52d62d-ff2d-46ec-9e3c-ed98673739ac","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"NO","amount":500,"action":"buy"}	2025-10-29 02:46:36.689911
fc4e51b0-6589-44ce-a85b-05768bd5eaa0	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"bcbc08f2-6a82-4ed8-b41a-eda2ef3e9be1","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:47:03.274365
f83ff652-c271-4042-9a9e-9d090bcdb4fa	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"a6137e2e-fa37-4f81-bcab-9bc08f0530b9","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:18.672549
0593fa59-06e4-48a0-8741-b6a1e0f2cab2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"0ca50bfc-aa18-44d4-8123-62ec474e24f4","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:21.76739
345a1915-9b62-494c-8852-335b95e0ce5d	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	new_bet	{"betId":"c2a4a91d-ff04-4f0d-9701-6685f6905e40","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:47:45.207042
25341926-56db-4f29-8dfd-197907e7b0cb	7c7bb616-dc44-412d-b05f-2c34fc58929b	new_bet	{"betId":"ef641307-327c-464f-a45f-358450ac272e","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:48:36.155926
99ce02a4-2b5f-4d4b-aba5-04a7008643d9	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"a1f444fb-4d5f-45b1-8ea6-907e8da65ec6","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:48:36.297781
5bcdc370-55a5-4267-a387-82240b98efa0	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"25d033c7-cc02-4a01-a98c-5cd1cfc51fb6","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:48:40.881476
0758e9b3-e938-427d-a34c-67ffdc3f9ff9	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"9991d510-7ceb-4baa-b656-4e7780f032cb","marketId":"5eb75da5-3e9c-4ddf-a60a-8960dccb0ea0","marketTitle":"Will zhynx rank higher than DJ.Σn on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:28.12634
26981353-dfce-460b-8c51-0968f6feb5b1	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"4431426e-5a16-4403-97f9-8a8e927eee4d","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:30.585298
34ec269b-73a6-4bce-8d51-acda46f2e609	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"ea565341-8cda-4346-ac6c-b573e3e111d7","marketId":"696b7e3f-44bb-408f-b490-482f4fb7bcc2","marketTitle":"Will Trenchman gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:31.232967
a0120931-729a-4099-97f6-a3027b0e4096	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"5b1e78fc-6c94-490d-808b-ea3b38ef5c30","marketId":"f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0","marketTitle":"Will Cooker gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:33.697114
fcb6ee6a-a890-448a-a546-ace3769bf5d2	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"8999bddc-af3a-4394-91e8-6542850a9247","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:36.971257
b17c3991-9a1b-4b4f-8813-23af52738ff0	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"50078f79-60e7-4bc9-9919-860b615d86f6","marketId":"d34373d6-1998-4d30-ad8b-86693941de64","marketTitle":"Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:40.047071
2a1435a6-0ff4-4b07-9006-ca5a65486e13	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"340691f2-80b5-4d44-a07b-4a3ecb42a4d3","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:43.684098
b3687211-d1c8-4c48-b77d-ece376a7c4d4	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"327b0016-4a38-46e4-b114-6479d45a8f5d","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:46.209666
6dc04d15-5964-4c4b-a668-fe01642e5e81	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"b2bae44e-65b7-4723-bcc3-4c27ba4e2f7c","marketId":"d5812241-a74a-4d80-81d3-eab0c8af3b5b","marketTitle":"Will Unknown maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:50.229165
5b9b82a5-521f-41d6-8ba9-a8bf4fa0210e	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"8654ec2e-205b-4e01-bd5b-a96748065d48","marketId":"ce750e89-ae58-40aa-8b69-ef078c54aff4","marketTitle":"Will oscar reach rank #13 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:52.675833
9cc7ce3d-bda9-47a0-ad5e-7d9ae1c4826d	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"fc333c54-5d63-4f3e-bcf1-2ed06f18aec5","marketId":"5877484f-f8a2-41b8-8889-7bac69f1c993","marketTitle":"Will ozark have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:49:55.131066
4501781a-1317-4041-8a43-581e21cb67e3	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"2790a711-c3dc-427d-a839-a4d668ae1b87","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:08.857743
1a112d6b-4962-4508-b636-5879ff1060d2	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"6fb38996-08d0-47b2-b431-ce5c62cba05b","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:31.622345
07b9cc66-6fef-4d31-b5a2-b18b7b4e74a2	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"4aaaf8f9-128e-4083-831a-5bcc3b3802eb","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:35.099927
bb36cacf-aa23-430d-8c46-279ee2d4d009	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"3850124f-7188-40dd-a1ce-72ddb094f67a","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:37.948558
fe3758d1-a392-46cf-a6ad-1dc3f7a0ae98	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"db4e7aeb-9e33-44b7-948f-1847790c46cb","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:40.579529
a87dd642-d24c-4d94-a79c-de84f18eacd9	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"35fc10a0-6b7a-480f-955a-10ca19afd0e0","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:43.557564
89b02f94-bbf9-4fbb-9d1b-574df99f6045	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"519ed339-837d-4961-a9f7-fefc929adc9d","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:45.670372
c86bf29d-8910-4729-a42e-b4f02dee4c60	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"97d68370-fd27-455b-bf9a-33ebd6507457","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:50:47.394589
0e65c1d2-0fc1-4b66-9071-b138c980d1b5	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"d8af1b49-8f32-4e49-a520-4d8f0e53a87e","marketId":"0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4","marketTitle":"Will Pain reach rank #14 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:50:57.011496
f17bd612-db9a-4593-bca0-5bd4a0eeee19	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"04474327-fa53-47d2-aaa5-1d890595c4c1","marketId":"af62438b-0dfd-4b7e-921a-c65249b9514b","marketTitle":"Will Heyitsyolo record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:01.102628
4633c13f-a43a-434d-b3f6-26a1a73f12a9	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"db9fc883-691f-4d18-86be-c6ccb76b1fae","marketId":"51fbe44c-ea10-43ad-ab46-37722bbe1409","marketTitle":"Will waste management rank higher than N’o on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:03.598913
8d6da606-192a-40fe-a9ba-b18c9f38fb6f	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"38c8776f-8251-48ee-9a79-5417ff4abc5b","marketId":"ae59057f-cbc0-4ee4-b623-257f78296ba4","marketTitle":"Will rayan rank higher than Pandora on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:05.333365
4064ab38-8d64-457d-a5b3-0cfe38a3f435	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"2aa747c1-07c8-4262-85b7-355c4d3f428c","marketId":"9461bb3d-c43e-445d-b561-8e5a4a9cea87","marketTitle":"Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:08.056734
f0069a20-28ba-474e-8246-d6cdd284587a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"02fe5f3d-9515-4675-b9ae-d75650c86544","marketId":"e6ce6e2c-77ed-4fd4-9687-23b604290619","marketTitle":"Will kitty rank higher than Cented on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:10.242596
43a66f63-db6d-40e7-968d-dccfe1c435b3	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"c78a07bb-2577-4cd2-9153-84196d2886c7","marketId":"f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0","marketTitle":"Will Cooker gain +50 SOL or more by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:51:13.391944
f632e849-d2cd-48df-b8b1-668d54085255	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"cba3a323-a894-45d2-bc9c-8b3b7365f0f1","marketId":"e1564a37-b27e-4380-a2b2-8054ff5ac4e3","marketTitle":"blixze ♱ to gain +15 SOL","position":"NO","amount":100,"action":"buy"}	2025-10-29 02:51:51.640064
487eceff-24b5-44b6-b2b3-4255881783a7	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"acccf8f3-2d26-4f0d-9c24-5cbfe5a49e06","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:52:33.94251
ce46fd25-1cf7-430b-a720-3a5add326aec	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"c9d7bf5c-ac45-4513-8fb1-db816ef4638c","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:53.479859
22ce15f9-44eb-4e4f-9c52-3ef4779c6eac	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"54303d61-c52d-41b3-ab24-53df52524f7b","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:42.045416
23a827fe-a47a-48b8-a8f0-bd68d6f1d591	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"2efe8ce7-6290-4867-8736-4ba9a611fe0d","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:46.299978
0409af10-40e5-489f-9876-4a4b9bd3bb56	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"f78be5a3-1c72-40c8-a036-a713c74c48d8","marketId":"ce750e89-ae58-40aa-8b69-ef078c54aff4","marketTitle":"Will oscar reach rank #13 or better by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:08.50817
de50c51b-b48b-4008-bda8-2a59c73dc7cb	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"8e29f737-82e9-442d-9e8a-ef8e3812a8d5","marketId":"12234807-e884-47ca-bf2c-e96e2d3ab1b4","marketTitle":"clukz to gain +25 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:15.039487
6a07769b-9c69-4294-8a98-f7f525284092	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"530e11c3-f4ba-4423-9faf-1dbea6964fb0","marketId":"153ca650-c833-4e43-8821-9df7b757ec29","marketTitle":"iconXBT to gain +35 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:19.225402
28169434-9509-4828-a72d-9f80f3125c08	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"2beaf310-9e15-4702-bc93-346d79403c0a","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 02:54:16.710379
57534868-9e57-4cbe-bd59-0685586448b1	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"b2f0d3c5-b41c-4f0e-b922-0f80afd26e2c","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"NO","amount":50,"action":"buy"}	2025-10-29 02:54:26.286389
fb7ee9e3-426e-4852-8f85-f214ee038a7e	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"9c8276a2-56ca-474e-9ba3-0922a24fbadd","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:54:37.159073
71581fd1-8537-4275-ac40-0254f4af503d	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"8f719e09-63b0-4377-b650-13b8a158fed7","marketId":"621f98b0-89ea-49de-8d53-e80a7df36042","marketTitle":"Will h14 have higher SOL gains than Gake on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:22.683507
fe4f778e-3731-46be-9deb-f1ffe76c61fb	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"171a1fc1-4335-4b8f-a14b-37086dffca3a","marketId":"0ae16313-0efe-4dd3-bc92-ca8bf2246903","marketTitle":"mog to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:28.340354
dc38d421-e30e-48ae-9567-5191cb99597e	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"219ed51c-75dc-4127-b69f-537835398219","marketId":"34a0781e-cde7-4eec-ac89-fdad71893214","marketTitle":"para to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:30.34919
cb5a597a-dbf1-4a60-9a9f-b25f0283aefb	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"206db6ed-eff4-4ca1-8621-954924e85849","marketId":"0ae16313-0efe-4dd3-bc92-ca8bf2246903","marketTitle":"mog to gain +15 SOL","position":"NO","amount":100,"action":"buy"}	2025-10-29 02:52:22.501373
ee369a00-baea-450b-805a-2935ff920b2a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"fc2f8680-f619-4376-bb22-f3eaa4fcc973","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:53:46.723126
1537f067-d404-46f9-b6a2-5425df4affd9	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"e27da32c-3444-4600-b2de-6c7477cfc35d","marketId":"f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0","marketTitle":"Will Cooker gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:12.02108
774384d6-44a6-427d-9f3b-609cc7890e08	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"85f121c0-2ab6-4026-ba4e-f3ee77b6af65","marketId":"5b4c6405-94b6-4e20-a87b-c5ec6256786f","marketTitle":"jester to gain +15 SOL","position":"YES","amount":10,"action":"buy"}	2025-10-29 02:51:33.114314
5f0f2ead-db2e-4a89-9a22-2942e87e76a3	116eace9-841b-48fa-a7ec-d3249bb3aa80	new_bet	{"betId":"21b11856-9130-493f-a954-282950d99781","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":410,"action":"buy"}	2025-10-29 02:52:44.931421
8ab3c724-7eb7-4567-908d-b62c2148d897	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	new_bet	{"betId":"9288bec2-5875-4c53-a470-f6c710887ad3","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":200,"action":"buy"}	2025-10-29 02:52:49.241044
3e86038a-e055-4ceb-9df9-4e636a0df1b7	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"318c90d7-7863-4906-a4ce-26203f463ae5","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:31.792961
7c105b8c-bfed-44c8-9b74-336e925cd08c	c37781bb-d03a-4b8f-aa8b-972ee268014a	new_bet	{"betId":"3d343c90-e502-401b-be35-36ecbb3f88e1","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:55:00.177406
4540e9c0-c546-4954-abb8-269dda26c2a4	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"9422d1a4-aedc-4fae-bf17-d46b90af3ec1","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:09.137481
42fddd7d-cddc-4e74-a798-4215ea8929e5	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"5c2609f0-c526-445f-9615-21d7c9254f82","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:16.207478
b6728711-fae2-4d33-924e-126dcab4da3a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"97178ad9-d2c1-4292-af91-42ba8ec4892f","marketId":"d34373d6-1998-4d30-ad8b-86693941de64","marketTitle":"Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:27.716699
6ff9fa16-15c3-47b6-9ec5-ed9498126183	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"9d800953-1dd6-4cae-81dc-00877c98a203","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:29.63589
f399f6c6-63e0-4b81-b3ab-2488c79881bf	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"cd4226cc-af96-40fe-a1a4-be042e2fb0a2","marketId":"d827611b-bd78-4f00-a05c-b68859aefca5","marketTitle":"Will Files rank higher than clukz on tomorrow's kolscan.io leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:31.757402
be8fdb0c-ee40-466e-a745-52d1c5dcf497	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"e9019c3b-117b-40fc-9e5e-e92319f9176d","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:54.682122
f54e9b82-2700-43d4-a380-be9b4929d44e	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"b54cba5b-ba22-49b1-9cb2-1d543a97ef36","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:14.652242
9167de51-9436-4578-8c31-fa671596a028	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"6ac0f5db-bb8f-4315-99dd-0b439c9d65b0","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:53:43.394076
e5471c10-6b6b-467a-a89c-aa5997c7fed6	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"f2b04a30-2070-4a78-9eb8-8d41655491a5","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:37.048067
2c2ea0eb-548b-4cda-b3f4-45e728e5dd1b	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"5998ae1d-07ef-4715-9985-e289a00fe343","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:27.315525
88887606-98c2-4a89-9add-208f29593ffe	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"34bb56b8-0d50-43aa-bf8f-daceeb51fa5a","marketId":"d5812241-a74a-4d80-81d3-eab0c8af3b5b","marketTitle":"Will Unknown maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:51.193806
62c410f3-a54b-457e-a33e-6f6b399bfbbe	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"03c49612-6c66-46ca-b69c-bbb26b98b134","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:53:54.647593
bab68ca2-49d9-437b-92bf-6b0d549fbee8	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"4b04acd7-c481-4b44-b812-c069c789f831","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:45.886654
51fd05a1-fbd5-4937-9032-0105c75e56d8	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"a7248731-0f5e-4ddf-8115-676230370311","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:01.898798
378a0fa3-23b9-4b19-a34e-e5df4b767684	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"6384388d-112d-4307-9fb6-3d868fdd6bae","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:25.531631
fbe40ed8-084f-43a9-8726-4285fe4ae443	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"5a1e4a0d-7a7e-4193-b92a-74e4ecbf9279","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:59.478168
fa0d059b-3039-451a-afe0-40a1235a0f4a	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"3cbde66d-b3b8-493c-9740-488145ecf480","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:42.456353
802c310a-c33c-45f9-825b-90ea75790812	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"eab801eb-fcb9-4896-9757-24061c9fa3b3","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:54:51.263223
2fd9be16-56b9-4395-aaa6-48c99c0c1738	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"9dadbc43-d697-48ca-a4d8-9aa51d6750ad","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:04.202326
c829f0bb-0229-4d9d-a9ae-d72c4c4df751	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"2aec9d34-3e2d-42c8-9aab-2f75fd04a9cb","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:55:04.38468
d6572578-0492-4deb-a144-5228907fdfad	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"96467dc1-2f71-4082-a42c-4f9b2ee56a10","marketId":"c05312e8-40bf-42a8-a95e-443f391f6045","marketTitle":"Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:03.813166
e42eb263-f69e-499f-ac35-5345022907bd	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"3557b692-2038-49ee-8c67-079d325fd0ee","marketId":"76909b2b-a9dd-41e2-a424-b01cdd5d2b8b","marketTitle":"Will Jidn maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:20.185845
e8503757-6792-4bd3-b2be-71ec70368850	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"b46f1693-5e58-4538-8a3a-57397282e1e4","marketId":"ad076954-b6fe-487f-aa79-8c2cbfdb62e4","marketTitle":"Will aloh record a win on tomorrow's leaderboard?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:22.592606
f5bc5be8-beb3-480d-b133-967dcc5f3fb3	781a2101-8dfc-480e-a185-69fab61df3cc	new_bet	{"betId":"85dab448-a427-407b-89d2-97f99f87ecb8","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":1,"action":"buy"}	2025-10-29 02:56:24.952824
cbecf740-d835-4667-9793-b437581b6220	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	new_bet	{"betId":"544f9435-6dd9-4d9e-8b83-b428b0d43c83","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 02:56:28.382082
6219198b-4ad2-42b9-88b8-6b04d1804ea8	6b9280e2-476c-430b-9470-05ee75118ac6	new_bet	{"betId":"839cb9e7-9be4-4acd-a72a-4a70d117b7fb","marketId":"ce750e89-ae58-40aa-8b69-ef078c54aff4","marketTitle":"Will oscar reach rank #13 or better by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 02:58:21.092022
b8aabaee-979e-4300-bbcb-0a5c2244575a	6b9280e2-476c-430b-9470-05ee75118ac6	new_bet	{"betId":"b125bd1d-454f-4e40-ad5a-0e7fcf27fd58","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":50,"action":"buy"}	2025-10-29 02:59:52.793115
cefc79f2-f9eb-4906-a023-5d31b3110086	6b9280e2-476c-430b-9470-05ee75118ac6	new_bet	{"betId":"5c28b328-85fc-4020-bb59-66ce21be06da","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 03:00:21.009888
a440a566-c211-46a5-8c0d-a0a074d47ec4	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"36c0f3b3-22ee-4536-b12a-c80a473f64d6","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":0.1,"action":"buy"}	2025-10-29 03:00:28.310798
3ac7e1f0-5c12-4335-b52e-6d0f37d5abfa	6b9280e2-476c-430b-9470-05ee75118ac6	new_bet	{"betId":"8acb5fd9-3b3e-418d-8f74-f6d94ec31e88","marketId":"34c43b93-174a-4546-9ad6-97bde99d37dc","marketTitle":"Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 03:00:53.259086
113678bb-cfec-4658-a40c-c17776b48b76	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"e8678d4e-4007-49b8-a273-4de7c78deb98","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 03:00:58.740726
95c4ac79-305a-4c1c-902e-a232deee7ae4	986f6e58-f06f-4981-a9a6-4d721e24cd15	new_bet	{"betId":"7dca2672-cfb1-47d5-965b-d4e11c41cb42","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 03:01:09.760174
3948586f-a7ed-4ac9-8819-1082736bc9d0	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"89cdbb83-12a6-4859-91eb-0b0d71777e29","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 03:01:13.638741
51509abe-e4fc-4659-a271-2739cf2b9794	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"e5c6c3a9-e589-494a-bbf4-e6a2f0a39cdd","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:02:48.005639
4e843296-9394-4b1c-9567-61de9b25c513	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"b61d0885-bb44-4f90-b09d-71bc8ee341c3","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:02:51.916171
328b4b53-a113-4a04-8f03-c6e47c151352	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"268b6bce-5a5b-420d-af89-b4ce2bed7b1f","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:02:58.293621
6cd0aa76-2499-4841-b433-6dee2747f090	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"bb07a53e-ba75-47e2-ab14-84271ee02b0b","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:03:02.097391
ff4432cf-0aa2-4eb6-b61e-90e275ea5a8b	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"f1ec7a0d-c0c4-454f-8a44-76239b8ad852","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 03:03:06.8702
531c7418-56c3-4914-9e56-c0995f2a80c6	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"8b927384-736b-4f82-888f-2e106af71fa5","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:04:00.049985
78018070-a3c6-4000-b4f4-4709f340a216	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"fbaee9c9-eef2-4e03-afa9-4053833c4537","marketId":"d827611b-bd78-4f00-a05c-b68859aefca5","marketTitle":"Will Files rank higher than clukz on tomorrow's kolscan.io leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:04:03.492148
2ba86688-0893-4033-935e-5982a2992167	0630514b-c953-4b9c-bea4-1fbe518040ef	new_bet	{"betId":"c2dda7d4-cae9-48d9-b09d-b071ddd8967d","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:07:06.413716
1289a57e-423d-46f4-9e3a-cb194a055169	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"82d1cd1e-22e8-48bf-b430-752ac83df6b4","marketId":"34c43b93-174a-4546-9ad6-97bde99d37dc","marketTitle":"Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:17:49.601449
457d9bd3-11a9-40c3-ad08-ed807bfa3550	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"ddc5de9b-a0e5-4667-850f-6df6e259ece1","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 03:17:56.07676
2b5366d2-98ed-4741-a319-54678981caad	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"e209bb37-afcd-4657-bbc8-99b77f161bf1","marketId":"d34373d6-1998-4d30-ad8b-86693941de64","marketTitle":"Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:17:58.247535
cb07d7b5-8fa0-4e46-bff7-9e09466467c1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"304ab82a-f7bb-46d9-a7a1-92ac1bdb37a2","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"NO","amount":500,"action":"buy"}	2025-10-29 03:18:12.261332
d45488ab-9312-443b-ab91-19de04fda8fb	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"90af1fcb-af6f-469f-8f3c-4a43e9853a7b","marketId":"36d4b50a-987e-4b93-864b-aca00db121f7","marketTitle":"Will BIGWARZ reach rank #10 or better by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 03:18:18.093024
2051fe24-55a5-4053-9f90-0b99a670dd30	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"3c2bc84f-19a8-42f0-b71a-85ce142bb6f0","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":159,"action":"buy"}	2025-10-29 03:18:44.849668
402f985d-e65d-468b-ad61-60d1b7562f99	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_bet	{"betId":"8d4f6595-c9c8-4835-ba74-d0f1f096bf5d","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":0.9,"action":"buy"}	2025-10-29 03:18:55.150205
547c4b5b-0882-4a1d-a85d-f926f01822a9	26a3a171-3b7e-4f87-b72e-9c8051be3497	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:33:53.239889
6d360371-8e36-49c0-b558-1650f1088f69	477a8b79-e143-4a9d-9973-a8cddae67200	new_bet	{"betId":"108e9c22-63bb-45da-a5d0-fd53006c07bd","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 03:40:10.886537
8ac8e34c-d23c-43c2-8968-0287d70467f8	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	new_bet	{"betId":"1b3a6fc7-ab05-4423-a454-888d9adde5f6","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 03:27:58.158651
665d701e-3f31-4d8d-9af5-8a1a7c6ae73b	746f0658-f3e6-44f4-bdb8-71345374be68	followed_user	{"followingId":"8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6"}	2025-10-29 03:32:31.097337
276b7bd8-a66a-4376-ac44-828dde0235e6	746f0658-f3e6-44f4-bdb8-71345374be68	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:32:42.983708
071181b3-8654-4332-bbd2-321bd3c855b6	99a56924-6436-455f-812d-56cddc5dd11d	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:33:06.769405
02ef2843-389e-4d0d-8d14-9e888df86cbe	937db43f-f8a7-4267-8642-6f3b7bf7daca	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:33:31.880464
5135d0c0-294e-4e65-9456-e6c847836fa7	6f27289a-df8a-460f-bacf-0e17c58639dc	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:34:11.823131
07583893-fc1b-4f94-b3e5-32286349b6fb	fab8990b-6a36-4d52-b34b-312848c2e947	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:35:02.188136
510b54fc-2da6-467f-a9a7-36275452f7c6	a3e9ed93-9377-4941-81a9-d46e27dd6a00	followed_user	{"followingId":"781a2101-8dfc-480e-a185-69fab61df3cc"}	2025-10-29 03:35:21.657596
093acf1f-5fe8-45ae-984c-060d769bdcc6	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	new_bet	{"betId":"e07b615f-c169-470d-9834-36fe79b23c75","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 03:37:52.677851
9a8f4990-5a99-4774-a5c3-b3106c25aca0	477a8b79-e143-4a9d-9973-a8cddae67200	new_bet	{"betId":"8bf8b9eb-af1a-4332-9013-c8f362054883","marketId":"d30c9b38-20d5-4921-9666-2efdd14c2a6a","marketTitle":"Will Ban gain +50 SOL or more by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 03:41:05.589685
99517364-599d-4657-a07e-e0493287e307	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	new_bet	{"betId":"e40a31a3-39fc-4a8a-9e70-e7ca4e22b317","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 04:21:07.92286
0da83651-7487-453e-b5ec-33230377e0d8	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	new_bet	{"betId":"c15ac404-1331-425a-a3f1-bf15ef1911d4","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 04:28:29.652032
e6dc3976-1a11-4f1e-828d-de4454a4413b	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	new_bet	{"betId":"0150206a-0bb3-4624-8fc1-b6fd7ea9c82b","marketId":"34c43b93-174a-4546-9ad6-97bde99d37dc","marketTitle":"Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 05:20:24.684784
ae0836ba-45ba-4eb2-a828-4955c9072af1	bd56d08d-5742-46cd-bc48-fb65d8d58111	new_bet	{"betId":"dbd0b202-cca6-4255-a149-eee18bdb6f78","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"NO","amount":10,"action":"buy"}	2025-10-29 05:46:05.376237
43a3bde4-db50-42e5-8439-da3878252bd7	97c3ead3-ae64-4a29-89da-5d5006dcbf43	new_bet	{"betId":"b23a2090-6c97-4929-92b3-1578dee24b2c","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 05:51:40.843429
d2db711f-1ce2-4d63-89f5-d546898f21d7	f166a726-47ab-404b-9555-16a114a5cb89	new_bet	{"betId":"d7760717-5afb-4fc9-b78a-f85d08da9b32","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 07:31:19.102109
ddcee782-e5e0-47e9-953d-270d60b7b06a	4cfa95be-699c-4019-b7e7-873475ad0fc5	new_bet	{"betId":"583d2ae0-98b0-49bc-8615-0586b78dd61b","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 08:23:11.755686
195446a5-c902-488a-8ec2-f9a349ff123e	23144889-a854-43a5-ada7-d9cb5abc31f0	new_bet	{"betId":"6de75f12-bfab-41f9-b267-02264af71401","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 09:03:44.068084
4bf07499-dc95-4c5c-a279-542fd022a0d0	088deaa4-8a69-4d01-ac4c-a00a67444efc	new_bet	{"betId":"cc2b903d-f564-4375-9ddb-9cd7074849c9","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 09:56:20.156998
c11cd324-e649-44ec-8b95-e4c259f13665	a85fd10a-3ea5-4f11-9740-799d19224b70	new_bet	{"betId":"dcebecbc-3e87-4559-ba4c-b80e578afb8f","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":10,"action":"buy"}	2025-10-29 10:06:38.084526
92f2dbcd-2a03-4b2c-b2b8-c261f668d608	a85fd10a-3ea5-4f11-9740-799d19224b70	new_bet	{"betId":"0556b6c7-972c-4e15-b8ed-bd6cbb9f374b","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":50,"action":"buy"}	2025-10-29 10:07:40.317701
bf1ab201-0fd5-4012-ac13-70cf8c4a0a26	ae6cf106-8d94-4ca6-9e85-8165196a9011	new_bet	{"betId":"bae2abc1-9662-4c9d-94eb-cc888fb1fea7","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 10:33:06.283598
392a78d2-0a2b-4922-96f8-88b2cafd0d11	ae6cf106-8d94-4ca6-9e85-8165196a9011	new_bet	{"betId":"636b1c60-0783-461d-adf5-2d16b5857789","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":400,"action":"buy"}	2025-10-29 10:33:36.98644
e5697e02-2282-4bf7-9105-6e6e0f949033	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"f00dc045-d18c-48a7-80bf-f62e835b53a7","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 11:12:41.990162
68550457-8725-45f1-b2a7-6a7c9165207d	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	new_bet	{"betId":"ef60dee5-b4fc-4748-8761-f78d9bbe7ca0","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 11:14:00.270712
b828d4f4-c09e-40c5-8178-04fdb52bf64e	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"42a06248-2f82-4fc6-809e-cf61818d9e1e","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"NO","amount":50,"action":"buy"}	2025-10-29 11:14:08.780867
a12c5589-be5a-43a3-8c08-8ff316ce02c4	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"03fc95e6-73ea-4f46-adba-295fca89485e","marketId":"41fc85d3-13b2-4e7b-8d04-2db65c3a5675","marketTitle":"Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?","position":"YES","amount":500,"action":"buy"}	2025-10-29 11:14:53.316018
46251141-6f61-4f74-87e2-da84f483f0d6	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"4708dd12-4e65-418b-9b3e-e3a4144bcc3b","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 11:15:47.291301
83361e83-059d-4bd9-add9-01f6e1cf7f41	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"9840f628-0d94-4658-b5f8-0a485189f5b4","marketId":"5ad16a19-1481-47b8-a791-69b314373c90","marketTitle":"Will dv have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 11:16:24.369469
5a40b1c7-42c8-4997-8371-54a5fbdc07b2	6f37eec8-c479-419d-bc02-5dc6064b7e2e	new_bet	{"betId":"138d147a-4ef1-4617-955a-9e6020d8eb36","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 11:29:06.069509
40570dca-67de-49f9-9050-4231ac0f6814	477a8b79-e143-4a9d-9973-a8cddae67200	new_bet	{"betId":"faaba100-7814-4949-a93d-7460976d24cb","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 11:37:25.342956
22a589e2-9a10-4a52-84b4-77c6af8b95e8	477a8b79-e143-4a9d-9973-a8cddae67200	new_bet	{"betId":"933e0a35-f439-4952-b032-6c405218b6f3","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 11:38:13.930293
3708f36c-869c-4f76-bf5a-c2239d8fcd8c	477a8b79-e143-4a9d-9973-a8cddae67200	new_bet	{"betId":"4991170c-40c8-4ef9-a56f-2a7a5c5ba58a","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":100,"action":"buy"}	2025-10-29 11:38:58.899178
06297344-d134-463a-a125-23e7504cc944	9095d825-361c-47f5-a10d-1aa6f559f7f5	new_bet	{"betId":"bfd18f1e-ab7c-4f3d-9a54-f6936d5e9faf","marketId":"7a6658de-1c31-445c-90e0-370fc3977773","marketTitle":"Cented to gain +15 SOL","position":"YES","amount":500,"action":"buy"}	2025-10-29 11:45:04.846758
43fa53bb-aff2-44c7-845d-2d5280013362	32735788-8647-4ccc-9ecb-54f45a69e878	new_bet	{"betId":"8817ea4b-500c-437f-b2ea-6aa58398b27b","marketId":"2f04d2b4-a630-4e96-8015-c5022e6c1b48","marketTitle":"Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 13:41:02.755653
d34b309c-6fe1-40da-b8a8-a346939c9b0d	64b0f2e4-508c-4efa-8b39-0b3569451567	new_bet	{"betId":"31faa8d6-a7c7-474a-9807-aba050252492","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"NO","amount":213,"action":"buy"}	2025-10-29 15:08:57.632523
ae70a48a-9e43-4aa5-912a-4dbcc4a971f0	5f8d475c-cbf4-4590-93f9-490db5f1eb48	new_bet	{"betId":"851db082-b0d0-4aea-b297-ce06aca8820d","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 15:43:46.923667
b9373a4d-7ff5-4239-9261-f76f79e3244c	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"baa918d2-b20a-40e7-9ee4-8379126a3fb8","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":100,"action":"buy"}	2025-10-29 15:56:51.220214
1f6d6d9a-2cb8-4b7e-9eba-7fde1af69ca4	9e1c1b26-c03b-4319-9e39-e477f314e814	new_bet	{"betId":"760e431b-fac8-4832-9e6f-f6f9c89a8229","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"NO","amount":50,"action":"buy"}	2025-10-29 15:59:36.905966
83aa8e53-dd80-46e2-8b21-0316974dd361	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	new_bet	{"betId":"b82a6466-9a38-4598-8a0f-da07f79f315b","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":500,"action":"buy"}	2025-10-29 16:03:51.861227
b6d7eafc-c1af-4e8b-9596-a71aac5cfb51	f166a726-47ab-404b-9555-16a114a5cb89	new_bet	{"betId":"5e4c5ade-47fd-43b5-b5a8-58d4be893625","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 17:10:22.899333
2dc7f2c8-99a2-4df9-b456-e6d2dcc2714e	74923495-465e-44cc-9609-5c8a1ed982ba	new_bet	{"betId":"587a53fa-2811-4120-a517-b8f032cd77ee","marketId":"21649439-df19-49a7-bd15-18cb5f39aeb9","marketTitle":"Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?","position":"YES","amount":50,"action":"buy"}	2025-10-29 17:18:26.95286
b9ade1e0-ae2f-4acb-9bfc-a29f106a8e98	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	new_bet	{"betId":"cbbb2245-9d21-44e8-859a-f1992a351a8f","marketId":"41efe570-c5e6-4f03-a3a9-003e1c80db46","marketTitle":"Will Scharo gain +50 SOL or more by tomorrow?","position":"YES","amount":50,"action":"buy"}	2025-10-29 18:24:56.075325
19958eb9-fd18-42f9-b397-ad10297c5fc0	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	new_bet	{"betId":"03dea7da-08fe-4c45-b6b3-cb54bbcbf209","marketId":"d56f2224-6c29-4110-8330-33dec782a2e2","marketTitle":"Will slingoor.usduc reach rank #11 or better by tomorrow?","position":"NO","amount":100,"action":"buy"}	2025-10-29 18:36:00.113239
4813a37a-367a-4ba5-b5f7-5a4c9ff7638c	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	new_bet	{"betId":"3c7d1755-5bff-4bfc-8388-b610c319034e","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 18:38:16.711522
96373463-f45f-41e7-95a6-6a24923cbd34	df9311d2-24d6-4018-9afb-e9d114f142c2	new_bet	{"betId":"9299db3c-9acc-4cf5-9057-ced39c799e31","marketId":"c4fadc68-4591-44c1-ae46-2b92182aaad6","marketTitle":"Will rayan have a better win rate than zhynx on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 19:00:28.086073
ed47b99b-4266-43e1-8115-37400d778b70	27432bf0-e96a-4136-88ed-fe24815881e6	new_bet	{"betId":"48a9d37a-12e7-45f6-8284-a6b680f9afa9","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":10,"action":"buy"}	2025-10-29 20:03:56.634429
b7be477c-52cb-4b73-9229-610d05cbc0f0	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	new_bet	{"betId":"5ff9e940-0e82-4951-b564-af414b916471","marketId":"f75b7fdf-79e6-431d-a12c-1ee2e43eab3f","marketTitle":"Will Danny maintain a top 10 rank on tomorrow's leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 21:02:59.864567
1f4aff58-a49c-4f57-8c25-d694258d87db	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	new_bet	{"betId":"14518425-569e-4816-8934-b390ad9ee1d5","marketId":"ae59057f-cbc0-4ee4-b623-257f78296ba4","marketTitle":"Will rayan rank higher than Pandora on tomorrow's kolscan.io leaderboard?","position":"NO","amount":500,"action":"buy"}	2025-10-29 21:06:16.54775
b6b4599e-c855-4b2a-9aa3-e0df1807f3a1	78692077-9972-4fc9-9757-92e393af4830	new_bet	{"betId":"3894b32a-4dab-4b04-b94d-14ddfb3ec265","marketId":"e3183a8b-006f-43f1-bce5-beecd73e4505","marketTitle":"Will big bags bobby record a win on tomorrow's leaderboard?","position":"YES","amount":10,"action":"buy"}	2025-10-29 21:24:13.927951
1cf64f51-76d7-44e8-ac24-ff2545ed071a	8c3fd324-9419-40fc-ab4d-22229b75b911	new_bet	{"betId":"f0314549-ef80-4835-80c6-47321101b76d","marketId":"de9f0b13-259c-495c-8497-072ec8d45331","marketTitle":"Will Beaver have a positive USD Gain on tomorrow's leaderboard?","position":"NO","amount":100,"action":"buy"}	2025-10-29 21:28:43.361583
ca1fa552-73e8-4ef4-b299-3e646d9bddc9	e373c930-5e25-404b-a36b-0faf910436a3	new_bet	{"betId":"a54174e5-b4b1-4e2d-a66b-df01d7cf7928","marketId":"e2b697e2-deda-4171-a6d9-0d1c66ba888f","marketTitle":"Will gr3g gain +100 SOL or more by tomorrow?","position":"YES","amount":800,"action":"buy"}	2025-10-29 21:49:10.315329
\.


--
-- Data for Name: bets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bets (id, user_id, market_id, "position", amount, price, shares, status, profit, average_cost, created_at) FROM stdin;
164f4263-60e8-480c-984e-53a375ae52ed	2a5a8384-d652-42e3-bed1-b03545d35725	73209b09-1398-4562-a07b-dbdfdd7d1ec8	YES	50.00	0.500000000	48.880000000	lost	-50.000000000	1.002400000	2025-10-27 00:50:41.722347
09fcdeef-84aa-452e-b3fd-5a6638e400b4	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	500.00	0.500000000	478.280000000	lost	-500.000000000	1.024500000	2025-10-27 02:06:53.043818
cf2ed0f4-f81d-4487-9ee1-d63750097392	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	100.00	0.512100000	92.920000000	lost	-100.000000000	1.054600000	2025-10-27 02:07:01.735365
d66a0757-5960-4b2f-a643-403475966ed5	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.514500000	46.130000000	lost	-50.000000000	1.062200000	2025-10-27 02:07:06.25889
7e6f1432-a52d-42b6-897e-875087d8eab7	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.515700000	45.910000000	lost	-50.000000000	1.067200000	2025-10-27 02:07:11.237134
51e020b0-ce33-4199-9393-d36ab4f47c09	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.516900000	45.700000000	lost	-50.000000000	1.072300000	2025-10-27 02:07:15.236204
0a90ef78-1da2-472a-8163-bfc6d3250f7e	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.518000000	45.480000000	lost	-50.000000000	1.077400000	2025-10-27 02:07:22.007349
7bd99def-ba95-404b-897a-c1ef54ff9539	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.519200000	45.270000000	lost	-50.000000000	1.082500000	2025-10-27 02:07:31.348822
8ea9f723-1cb2-4291-864a-4bd2d92f873f	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.520400000	45.050000000	lost	-50.000000000	1.087600000	2025-10-27 02:07:37.536118
13e13539-49e5-48a6-b0f7-aa7a1ce35d82	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	50.00	0.521600000	44.840000000	lost	-50.000000000	1.092700000	2025-10-27 02:07:46.041975
7293a639-9b2c-4ec1-a07a-754797540ad4	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	9eddb4ed-8e10-48e7-abf3-3621f24319bb	YES	500.00	0.750000000	478.280000000	lost	-500.000000000	1.024500000	2025-10-27 15:49:33.474765
ae0a109f-ef73-4b1b-8129-13c5760001ca	72e306d2-207c-462c-9415-a0c7aa96a2ab	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	500.00	0.466300000	478.280000000	refunded	0.000000000	1.024500000	2025-10-27 16:26:30.19125
4c774a50-8a22-43cb-8d29-2cd9509af935	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	100.00	0.512100000	92.920000000	refunded	0.000000000	1.054600000	2025-10-27 16:26:45.713959
8736a822-592d-4cfb-a3ab-b0cf6da03ccc	72e306d2-207c-462c-9415-a0c7aa96a2ab	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	500.00	0.514500000	451.660000000	refunded	0.000000000	1.084900000	2025-10-27 16:27:03.829359
14ecf6d9-6e06-4f5c-9da7-8d8a73a7d7fd	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	500.00	0.526200000	431.140000000	refunded	0.000000000	1.136500000	2025-10-27 16:27:29.312988
bb068e2a-968c-486f-98d2-450c12d1e615	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	500.00	0.537700000	411.980000000	refunded	0.000000000	1.189400000	2025-10-27 16:27:37.05216
74d28bc2-315b-45d4-9a50-c2a63f252893	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	11e1fe6c-07dc-4463-a338-de6f7bab83aa	YES	500.00	0.050000000	478.280000000	lost	-500.000000000	1.024500000	2025-10-27 15:56:23.733394
4183c641-1193-476c-a1cc-7320f9ac26aa	9834faee-2e62-43c4-8bdf-e8a48c024bd0	621f98b0-89ea-49de-8d53-e80a7df36042	YES	100.00	0.486000000	97.520000000	open	\N	1.004900000	2025-10-29 00:13:26.274596
f93336c0-2606-4a34-b905-f64a7d20de31	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	100.00	0.810000000	97.520000000	open	\N	1.004900000	2025-10-29 00:14:17.125869
76e41b06-001a-410b-9472-591df2d43e30	d8c125df-fb1f-4755-9975-1e23ffdd006a	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	10.00	0.495500000	9.800000000	open	\N	1.000500000	2025-10-29 00:15:27.628916
7db9054d-57f0-4a05-883e-36af38cf54f3	8903720d-1010-4477-a548-0fa98558c462	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	50.00	0.507700000	48.880000000	open	\N	1.002400000	2025-10-29 00:31:21.550961
9f3dae7d-2b63-4e33-9b9c-381fbe797f53	8903720d-1010-4477-a548-0fa98558c462	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	100.00	0.650000000	97.520000000	open	\N	1.004900000	2025-10-29 00:31:45.16686
cf689ca2-23d1-473c-ad8b-e3b4a3710ff2	2cebf2a9-8cd9-41e2-8a76-357570839646	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	10.00	0.614800000	9.800000000	open	\N	1.000500000	2025-10-29 00:32:42.119324
d5e851c4-3a8e-4a3c-b3cf-ddcb539edff3	8903720d-1010-4477-a548-0fa98558c462	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	YES	100.00	0.460000000	97.520000000	open	\N	1.004900000	2025-10-29 00:32:43.583584
184e7eee-7f33-4a51-a4af-98291b48e049	8903720d-1010-4477-a548-0fa98558c462	af62438b-0dfd-4b7e-921a-c65249b9514b	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 00:33:18.874206
45f2874b-6e47-42e0-8e1f-972dcee52b19	8903720d-1010-4477-a548-0fa98558c462	5ad16a19-1481-47b8-a791-69b314373c90	YES	50.00	0.650000000	48.880000000	open	\N	1.002400000	2025-10-29 00:33:27.801152
66130f1f-0013-4b4d-a4e6-4c78a970c350	8903720d-1010-4477-a548-0fa98558c462	ef4592dd-1cc6-4da6-80ad-c185d04b83e8	YES	100.00	0.840000000	97.520000000	open	\N	1.004900000	2025-10-29 00:33:42.31956
02dfabd4-1f21-468b-9ef2-466d4db9d4f1	8903720d-1010-4477-a548-0fa98558c462	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	50.00	0.502400000	48.410000000	open	\N	1.012300000	2025-10-29 00:36:51.629264
30e7eddd-479d-4efe-bba0-0b2cfd510783	8903720d-1010-4477-a548-0fa98558c462	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	YES	100.00	0.502400000	96.580000000	open	\N	1.014700000	2025-10-29 00:37:07.213039
468e49c8-36f6-40b6-b014-7cf729ad66c1	c694679a-47f2-416e-8e5f-34735fba5715	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 00:43:08.966572
0df957cf-b0f9-4f8e-89a6-970dee892014	c694679a-47f2-416e-8e5f-34735fba5715	de9f0b13-259c-495c-8497-072ec8d45331	YES	10.00	0.650000000	9.800000000	open	\N	1.000500000	2025-10-29 00:43:40.574957
e5ff9495-d210-437b-8527-084c4b892843	c694679a-47f2-416e-8e5f-34735fba5715	d56f2224-6c29-4110-8330-33dec782a2e2	YES	500.00	0.300000000	478.280000000	open	\N	1.024500000	2025-10-29 00:43:51.413699
982df626-cc04-4f81-87af-969aa9c1c250	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	50.00	0.317100000	48.880000000	open	\N	1.002400000	2025-10-29 00:45:04.803493
21c10581-7a74-4ca8-91ee-5dae7c0b5612	47887516-721e-4369-9fb0-918c63bb8227	696b7e3f-44bb-408f-b490-482f4fb7bcc2	NO	999.00	0.664300000	933.330000000	open	\N	1.049000000	2025-10-29 00:52:13.88472
9a0b792b-3208-40fa-be4d-e8b6a4a73f5d	4a6a595c-f247-4f53-a589-e606cc428bc1	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	100.00	0.840000000	97.520000000	open	\N	1.004900000	2025-10-29 00:56:47.384946
d5f3bdb5-ce9d-43ff-a82e-df5f339edd45	769a0aa2-9ce2-4a09-8efb-697727a78239	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.512100000	9.330000000	open	\N	1.050100000	2025-10-29 00:59:34.444556
5a2cde4b-e988-4d4d-a110-b5cc8d39d39b	4a6a595c-f247-4f53-a589-e606cc428bc1	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	500.00	0.502400000	473.680000000	open	\N	1.034400000	2025-10-29 01:04:16.062373
2ab1a2cb-dace-4947-8aa7-26f6684fc89e	088deaa4-8a69-4d01-ac4c-a00a67444efc	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	50.00	0.499800000	48.930000000	open	\N	1.001500000	2025-10-29 01:05:47.252577
77f2da9b-9eeb-410b-a966-8f8b7528e784	30505fa7-dbbb-45c9-b704-5498b6ce730d	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.501000000	9.760000000	open	\N	1.004400000	2025-10-29 01:12:22.113134
ce0b41a6-6bb2-4179-9268-f2bf7dfb1a04	01289b67-bc83-469e-99a1-356102efe0fd	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	500.00	0.501200000	475.970000000	open	\N	1.029500000	2025-10-29 01:17:16.311129
be08e159-2663-4040-be73-8f132d294aad	ce45f9ea-0146-431f-9469-15e31de21981	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.513300000	9.290000000	open	\N	1.055100000	2025-10-29 01:37:15.866343
265a6e8a-874e-459b-8141-c9105d34e9cf	aec40e30-e922-4f47-8552-c07c08a12e9a	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.513500000	9.280000000	open	\N	1.056100000	2025-10-29 01:37:23.221561
a80f4c0e-2855-4cf8-8a28-f93c14c17c25	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	10.00	0.496300000	9.940000000	open	\N	0.985900000	2025-10-29 01:38:38.69574
e94637d6-62d9-49a4-a067-0312464693f4	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	990.00	0.496600000	937.740000000	open	\N	1.034600000	2025-10-29 01:38:53.53887
4ddab040-2bf0-44ae-b8cf-ba8ddd3258d5	0238327d-15b3-41ae-b52c-cf223ee9832c	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	500.00	0.498800000	480.600000000	open	\N	1.019600000	2025-10-29 01:48:54.558174
6bec6ec1-097c-4e54-90de-dafa96a59472	0238327d-15b3-41ae-b52c-cf223ee9832c	e6ce6e2c-77ed-4fd4-9687-23b604290619	YES	100.00	0.445000000	97.520000000	open	\N	1.004900000	2025-10-29 01:49:14.429885
09fe1c65-aaa8-4d9a-bb8d-bf35d35c2011	b03668e6-821a-4e06-b541-1cd2e0ea45af	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	100.00	0.527500000	87.370000000	open	\N	1.121700000	2025-10-29 01:58:20.453376
e7eb7aac-6cae-4a11-87e9-a63b9cd6dcf6	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	100.00	0.423200000	97.520000000	open	\N	1.004900000	2025-10-29 02:05:41.935751
e2a4153c-90cb-494b-9b8b-f5984d9efca0	411dc4b0-c7f6-44ba-a7cd-dab215760984	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.503900000	96.010000000	open	\N	1.020700000	2025-10-29 02:12:46.40777
427971a8-c840-43dd-be77-0441550ddc5a	d6f78f80-b222-49b8-9412-eea692bcaa34	d30c9b38-20d5-4921-9666-2efdd14c2a6a	NO	50.00	0.606000000	48.880000000	open	\N	1.002400000	2025-10-29 02:17:37.580396
5ea40eb5-e7c3-4313-b7f5-15b628c6a393	b03668e6-821a-4e06-b541-1cd2e0ea45af	d34373d6-1998-4d30-ad8b-86693941de64	YES	100.00	0.500000000	97.520000000	open	\N	1.004900000	2025-10-29 01:41:46.173925
e6501650-aad9-41af-8900-21983cc84cd9	7f0a9138-5a4d-4955-8895-dc27436f10b2	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	10.00	0.520400000	9.030000000	open	\N	1.085700000	2025-10-29 01:44:09.135858
1bc1c10d-73d9-4909-ba53-2b54fc5ff2d1	00772767-41bc-4967-8266-5541d53b105e	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1000.00	0.479300000	1012.730000000	open	\N	0.967700000	2025-10-29 01:47:44.804567
3db00ddc-2097-40f0-989f-85aa974ef28a	0238327d-15b3-41ae-b52c-cf223ee9832c	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	100.00	0.501200000	97.050000000	open	\N	1.009800000	2025-10-29 01:48:29.78099
24e141a5-3c46-439d-8ede-3cf47feb03eb	0238327d-15b3-41ae-b52c-cf223ee9832c	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.500200000	97.430000000	open	\N	1.005900000	2025-10-29 01:48:44.873284
200b93a4-5d1e-429e-a5c1-e8f4855333c4	0238327d-15b3-41ae-b52c-cf223ee9832c	36d4b50a-987e-4b93-864b-aca00db121f7	YES	100.00	0.050000000	97.520000000	open	\N	1.004900000	2025-10-29 01:49:06.944401
f6904d6a-c3bd-4e89-8cff-9c9279c99594	0238327d-15b3-41ae-b52c-cf223ee9832c	621f98b0-89ea-49de-8d53-e80a7df36042	YES	100.00	0.502400000	96.580000000	open	\N	1.014700000	2025-10-29 01:49:20.604877
cbe97e85-e7ae-4efd-abe0-fced10679d38	0238327d-15b3-41ae-b52c-cf223ee9832c	36d4b50a-987e-4b93-864b-aca00db121f7	YES	98.00	0.502400000	97.520000000	settled	-2.000000000	\N	2025-10-29 01:51:07.288662
14bdb097-6d24-4a45-98e7-4214cf67c575	0238327d-15b3-41ae-b52c-cf223ee9832c	e6ce6e2c-77ed-4fd4-9687-23b604290619	YES	98.00	0.502400000	97.520000000	settled	-2.000000000	\N	2025-10-29 01:51:21.263616
6cae2c81-6066-4779-bd0d-57269475014d	0238327d-15b3-41ae-b52c-cf223ee9832c	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	98.00	0.502700000	97.430000000	settled	-2.000000000	\N	2025-10-29 01:52:16.106769
5729296b-81fb-4de5-a697-eb445ddf4943	c37781bb-d03a-4b8f-aa8b-972ee268014a	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	50.00	0.500200000	48.830000000	open	\N	1.003400000	2025-10-29 01:56:01.419563
42299002-f4e6-4165-afe0-eece4255e5f7	c37781bb-d03a-4b8f-aa8b-972ee268014a	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.501500000	96.950000000	open	\N	1.010800000	2025-10-29 01:56:21.762771
a923f01c-228e-401a-b33c-92c5eb05cbc5	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	500.00	0.530100000	424.640000000	open	\N	1.153900000	2025-10-29 02:28:20.593715
81792d36-f986-4298-9532-aa7abf64acb6	d3e4a456-7bbd-461c-8806-50dee853d118	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	500.00	0.498300000	481.530000000	open	\N	1.017600000	2025-10-29 02:31:20.708527
66bc3c48-0a2e-481d-968b-1073684deeb1	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	10.00	0.510400000	9.400000000	open	\N	1.043100000	2025-10-29 02:31:47.951662
a5bd61e1-c40e-4b2d-8fad-b008eecc6097	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.502600000	9.690000000	open	\N	1.011100000	2025-10-29 02:38:36.013725
26396821-12d4-4b9e-8964-9c524d724cae	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	10.00	0.510900000	9.380000000	open	\N	1.045100000	2025-10-29 02:38:38.005309
ab87b012-346d-4db7-a7c6-fb0234fb261e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	c05312e8-40bf-42a8-a95e-443f391f6045	YES	10.00	0.450000000	9.800000000	open	\N	1.000500000	2025-10-29 02:38:48.366727
4beb140b-6fb5-4748-a345-b05fb0f318f9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	10.00	0.300000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:00.292238
9b923e82-d192-48c2-8c91-389505b3900a	bdefc13e-f3e5-49a2-b749-4aa864027d42	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.513800000	9.270000000	open	\N	1.057100000	2025-10-29 01:48:48.788353
6fd90942-7d28-4f20-9c3b-20f1ad89864f	0238327d-15b3-41ae-b52c-cf223ee9832c	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	98.00	0.503700000	97.050000000	settled	-2.000000000	\N	2025-10-29 01:49:55.248247
5fbc4b0c-6d44-4297-895a-24bde281a532	0238327d-15b3-41ae-b52c-cf223ee9832c	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	490.00	0.510900000	480.600000000	settled	-10.020000000	\N	2025-10-29 01:50:05.690227
d7a17e32-5320-4004-ae46-ef4225aabcfd	0238327d-15b3-41ae-b52c-cf223ee9832c	621f98b0-89ea-49de-8d53-e80a7df36042	YES	98.00	0.504900000	96.580000000	settled	-2.000000000	\N	2025-10-29 01:51:27.555818
7d58709f-3dd5-4684-9e79-0feb39144791	5cdda325-1f54-42bc-b1d1-7479913fc3f5	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	100.00	0.504200000	95.890000000	open	\N	1.022000000	2025-10-29 01:51:48.152298
580944f6-07c8-4961-b217-370f5ffee905	0238327d-15b3-41ae-b52c-cf223ee9832c	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	882.00	0.506700000	807.200000000	open	\N	1.070800000	2025-10-29 01:52:04.206533
48eae729-dd9c-4bd5-8552-7bc8477cacc4	0238327d-15b3-41ae-b52c-cf223ee9832c	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	98.00	0.498800000	96.050000000	open	\N	0.999900000	2025-10-29 01:52:39.076722
aececbe4-4255-42ce-917e-6e63500ca7e4	898e8852-e40d-4b2a-a8f7-3e215268febc	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	50.00	0.500200000	48.830000000	open	\N	1.003400000	2025-10-29 01:57:52.644509
df4f45b4-0952-460e-88c5-60dbb103b6dc	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	50.00	0.501200000	48.650000000	open	\N	1.007200000	2025-10-29 02:04:20.774704
92cc4860-4254-4042-b0ea-c2fe279316d9	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.529800000	8.690000000	open	\N	1.127400000	2025-10-29 02:15:40.410953
0adeb93a-44ec-4cff-a1d8-ca786d23ba6b	d6f78f80-b222-49b8-9412-eea692bcaa34	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	500.00	0.486000000	505.510000000	open	\N	0.969300000	2025-10-29 02:18:18.731778
1d587a4e-b012-453a-af1e-9e5d6d62ca5f	d6f78f80-b222-49b8-9412-eea692bcaa34	d5812241-a74a-4d80-81d3-eab0c8af3b5b	YES	450.00	0.630000000	431.490000000	open	\N	1.022000000	2025-10-29 02:18:38.334634
f6e7022f-f6f6-41dd-b13f-41df29e1d7b6	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	10.00	0.501500000	9.740000000	open	\N	1.006400000	2025-10-29 02:30:39.809856
b0bf4611-c653-42dc-89ec-54388d211e3a	37ed79db-51d0-4907-aa94-75502fa74c5e	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	500.00	0.502400000	473.680000000	open	\N	1.034400000	2025-10-29 02:32:52.713846
418a08ea-f48d-400a-b968-a25d2c2f6695	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	10.00	0.510700000	9.390000000	open	\N	1.044100000	2025-10-29 02:37:45.02125
709e8403-6c96-4a02-a9fe-623e74f27f64	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	50.00	0.506300000	47.660000000	open	\N	1.028100000	2025-10-29 02:37:53.363274
543d5233-2da3-45c0-bf32-5cd70efc4b02	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	de9f0b13-259c-495c-8497-072ec8d45331	YES	50.00	0.500200000	48.830000000	open	\N	1.003400000	2025-10-29 02:38:01.783617
9b87ab09-8af1-4823-9b5c-0f0f296bf2c2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.502400000	9.700000000	open	\N	1.010100000	2025-10-29 02:38:08.463138
92019caf-10a4-473d-a60e-8fc9a589da36	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.00	0.507500000	9.500000000	open	\N	1.031100000	2025-10-29 02:38:12.933887
cb1eab04-71db-4acc-989b-3c4fb00d84af	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.541400000	8.300000000	open	\N	1.181100000	2025-10-29 02:38:18.269539
e370b63b-bb18-4d7c-bab6-ba678f819dbf	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.501600000	9.730000000	open	\N	1.006800000	2025-10-29 02:38:22.077941
06f88a9a-c6db-4d6e-b651-2888684a958b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.514500000	9.240000000	open	\N	1.060200000	2025-10-29 02:38:30.525284
270c0bc8-f124-4171-b949-53129dded070	e5275105-2102-4d2c-afda-0440b7afaab3	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	NO	10.00	0.485500000	10.380000000	open	\N	0.944200000	2025-10-29 02:38:30.903863
9e574d3f-5383-43cc-a964-37b2a290085c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	10.00	0.501200000	9.750000000	open	\N	1.005400000	2025-10-29 02:38:42.663786
70af32f4-b20c-49e3-8849-f3e575b13308	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.512300000	9.320000000	open	\N	1.051100000	2025-10-29 02:38:42.968787
8c234e5e-b990-4a7e-bbe4-6b0040f336b4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	5877484f-f8a2-41b8-8889-7bac69f1c993	YES	10.00	0.650000000	9.800000000	open	\N	1.000500000	2025-10-29 02:38:54.011747
d00d5715-4842-47fa-8815-419999f93602	e5275105-2102-4d2c-afda-0440b7afaab3	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	500.00	0.514700000	451.240000000	open	\N	1.085900000	2025-10-29 02:39:03.856728
638ec9cd-8ed2-4868-8c97-50345461c876	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ad076954-b6fe-487f-aa79-8c2cbfdb62e4	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:04.521937
f0792a47-49f6-4b16-b992-84c2d8cf833b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	YES	10.00	0.450000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:15.949062
6c63aa74-6a45-44ce-9ace-2c50b3a7298e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2671622-4131-4733-8176-eb9c27780278	YES	10.00	0.570900000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:16.166736
dd3fd94c-10d9-479f-96c4-d2cea98d54ba	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	10.00	0.690000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:22.905832
f308bddb-80fb-4206-b8b8-499ce848c8b3	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	91c019e2-7233-495a-988a-8d4c7cdccd2b	YES	10.00	0.650000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:25.490282
a57bdd59-ff7f-40ae-9a2e-67bd9b935ddd	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	6018a059-bdde-4605-8636-8c8ab7fadd6e	YES	10.00	0.300000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:26.244826
9479e942-6679-453d-80be-b5a426c5a50e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	20250d49-1b4b-4096-a17c-6a6de8e21747	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:31.156751
1fdc03e3-f216-494d-836c-6cac8a8df047	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ae59057f-cbc0-4ee4-b623-257f78296ba4	YES	10.00	0.565000000	9.800000000	open	\N	1.000500000	2025-10-29 02:39:38.866056
83141eeb-8985-4e1c-8cc9-3680fc86f6e5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ef4592dd-1cc6-4da6-80ad-c185d04b83e8	YES	50.00	0.502400000	48.410000000	open	\N	1.012300000	2025-10-29 02:39:52.451324
0a72981d-a0d0-41f2-a66c-a0c9ab9f57f0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	696b7e3f-44bb-408f-b490-482f4fb7bcc2	YES	50.00	0.476100000	53.780000000	open	\N	0.911200000	2025-10-29 02:40:10.201303
619c550f-b946-4b8e-a079-981763ab61c2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d34373d6-1998-4d30-ad8b-86693941de64	YES	50.00	0.502400000	48.410000000	open	\N	1.012300000	2025-10-29 02:40:10.295179
534d35da-0794-47d2-8b2d-944ae3a09259	e5275105-2102-4d2c-afda-0440b7afaab3	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	100.00	0.498200000	98.230000000	open	\N	0.997700000	2025-10-29 02:40:21.322139
c6674308-1f38-48f2-afa4-27476a4a7d04	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0ae16313-0efe-4dd3-bc92-ca8bf2246903	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 02:40:36.087302
7ea2d203-1385-4822-8d75-73654e81ad83	e5275105-2102-4d2c-afda-0440b7afaab3	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.507800000	94.540000000	open	\N	1.036600000	2025-10-29 02:40:36.698565
43d8ed5a-b7cb-45b7-bcfe-dc8fa4ad4fe3	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	34a0781e-cde7-4eec-ac89-fdad71893214	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 02:40:40.445071
ed4350b2-7e0e-4fc9-8337-7d93791edecc	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	5b4c6405-94b6-4e20-a87b-c5ec6256786f	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:40:40.56623
81acfc82-96f1-465f-b829-0426899066c0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e1564a37-b27e-4380-a2b2-8054ff5ac4e3	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:40:46.62027
e654d106-cf33-4e3e-9b51-2aff47ba260d	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	15fef1cb-7d54-4348-9005-4512771e0ba1	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:40:46.63494
edc93077-ae1b-4f23-b758-7012409b0b9c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	962fec63-4816-4bbb-9970-3f002fb86e02	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:40:47.614496
21274a85-a791-4891-ab61-f33708f35b07	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	18b3c5bd-541a-4ab9-bb77-a92510f6808a	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 02:40:52.355664
012ef30b-f38f-4db3-99b9-db1d000593a1	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.502900000	9.680000000	open	\N	1.012100000	2025-10-29 02:41:17.843267
33297b17-a4bb-40ae-b702-5c4a626861d9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503100000	0.970000000	open	\N	1.012600000	2025-10-29 02:41:49.556374
5160d71e-9cdc-440f-9e29-5808b8f7e160	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503200000	0.970000000	open	\N	1.012900000	2025-10-29 02:41:55.229635
bdcfa728-7126-4847-8bf7-cd008795c9d4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503200000	0.970000000	open	\N	1.013000000	2025-10-29 02:41:58.626148
8dc79b74-50ed-43dd-bcba-082a2d89b33f	e5275105-2102-4d2c-afda-0440b7afaab3	5ad16a19-1481-47b8-a791-69b314373c90	NO	50.00	0.498800000	49.120000000	open	\N	0.997600000	2025-10-29 02:42:05.702956
2f2b7d56-1cae-4905-8fa7-f380566db533	e5275105-2102-4d2c-afda-0440b7afaab3	36d4b50a-987e-4b93-864b-aca00db121f7	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 02:42:28.150852
dacb116c-63ee-4dbd-a050-8d81497b5d7e	e5275105-2102-4d2c-afda-0440b7afaab3	c05312e8-40bf-42a8-a95e-443f391f6045	YES	100.00	0.500200000	97.430000000	open	\N	1.005900000	2025-10-29 02:42:50.701701
e26d58e1-5211-41b8-b706-ab41a8120213	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503400000	0.970000000	open	\N	1.013700000	2025-10-29 02:43:04.303979
22afcc53-be27-4232-be89-5c0f09725ea1	116eace9-841b-48fa-a7ec-d3249bb3aa80	de9f0b13-259c-495c-8497-072ec8d45331	YES	10.00	0.501500000	9.740000000	open	\N	1.006600000	2025-10-29 02:43:41.141016
4c5b0f57-202e-472e-b325-290d7aac880d	116eace9-841b-48fa-a7ec-d3249bb3aa80	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	50.00	0.488900000	51.110000000	open	\N	0.958800000	2025-10-29 02:43:50.340425
f7eb5cfe-4d78-462a-af12-fc1178de3357	e5275105-2102-4d2c-afda-0440b7afaab3	36d4b50a-987e-4b93-864b-aca00db121f7	YES	20.00	0.501200000	19.490000000	open	\N	1.005900000	2025-10-29 02:45:22.588454
37d22865-8fda-421b-beb4-ee0537681969	7c7bb616-dc44-412d-b05f-2c34fc58929b	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	50.00	0.510400000	46.890000000	open	\N	1.045100000	2025-10-29 02:46:24.62101
5d52d62d-ff2d-46ec-9e3c-ed98673739ac	898e8852-e40d-4b2a-a8f7-3e215268febc	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	500.00	0.490100000	497.360000000	open	\N	0.985200000	2025-10-29 02:46:36.641938
18226049-2e8b-4cdf-b2e2-ec15b53976bc	7c7bb616-dc44-412d-b05f-2c34fc58929b	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	500.00	0.542100000	404.790000000	open	\N	1.210500000	2025-10-29 02:46:47.713461
a6137e2e-fa37-4f81-bcab-9bc08f0530b9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1.00	0.553100000	0.790000000	open	\N	1.237800000	2025-10-29 02:47:18.622991
40bb18f4-8fe6-412a-b7eb-bc08a05bda36	7c7bb616-dc44-412d-b05f-2c34fc58929b	d56f2224-6c29-4110-8330-33dec782a2e2	YES	50.00	0.512100000	46.570000000	open	\N	1.052100000	2025-10-29 02:47:28.019215
699e7e59-e484-4ffa-81f6-1a6046a7b173	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	10.00	0.497600000	9.890000000	open	\N	0.990900000	2025-10-29 02:49:05.013264
a1d703a3-86ad-40d5-ba51-cde9265a58cd	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	6e5fd4b5-651b-482b-a6b9-36f7cdf769ba	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:40:47.42185
a9e7bbcf-ab6e-45d8-974c-746c3cb79980	116eace9-841b-48fa-a7ec-d3249bb3aa80	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.541900000	8.280000000	open	\N	1.183300000	2025-10-29 02:43:14.632497
caf04a91-ee81-466e-bc46-4d9ad0c2876c	116eace9-841b-48fa-a7ec-d3249bb3aa80	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	500.00	0.473500000	531.030000000	open	\N	0.922700000	2025-10-29 02:44:03.097651
a67cc0f5-a4fc-4d3b-bbc2-050380d51f4d	e5275105-2102-4d2c-afda-0440b7afaab3	de9f0b13-259c-495c-8497-072ec8d45331	YES	50.00	0.501800000	48.540000000	open	\N	1.009500000	2025-10-29 02:44:37.577165
f743bd2a-02b8-4dac-a1f8-fef9df7dd309	e5275105-2102-4d2c-afda-0440b7afaab3	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.501200000	9.750000000	open	\N	1.005300000	2025-10-29 02:44:45.623662
b7da1153-f007-4096-af20-8d75c34ca24a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	1.00	0.497600000	0.990000000	open	\N	0.990300000	2025-10-29 02:47:26.011204
4d435b05-e9c2-475c-82cd-090503e0842c	7c7bb616-dc44-412d-b05f-2c34fc58929b	de9f0b13-259c-495c-8497-072ec8d45331	YES	100.00	0.503000000	96.370000000	open	\N	1.016900000	2025-10-29 02:47:36.570588
06ff8b04-945b-4e46-8c8c-659dbe5f1777	781a2101-8dfc-480e-a185-69fab61df3cc	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.555400000	7.840000000	open	\N	1.249600000	2025-10-29 02:48:54.628489
de811dff-4957-45b0-bc24-9df5168dde0d	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	10.00	0.505700000	9.580000000	open	\N	1.023500000	2025-10-29 02:49:02.543254
d5c7f913-730f-43d3-87c6-33993d251ad3	781a2101-8dfc-480e-a185-69fab61df3cc	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.513600000	9.280000000	open	\N	1.056200000	2025-10-29 02:49:08.146178
9b7afacb-98d6-4ae8-9f23-68888ebf9d7b	781a2101-8dfc-480e-a185-69fab61df3cc	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.00	0.514000000	9.260000000	open	\N	1.058200000	2025-10-29 02:49:15.257907
874e357d-282b-4529-923e-0c89e2802e07	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	7a6658de-1c31-445c-90e0-370fc3977773	YES	50.00	0.500000000	48.880000000	open	\N	1.002400000	2025-10-29 02:40:52.236433
0b270dda-b5d4-4080-8d17-6c550aab24e2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.541600000	8.290000000	open	\N	1.182100000	2025-10-29 02:41:21.515371
33a51963-cccd-4037-959e-e5ffe2297a74	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1.00	0.541800000	0.830000000	open	\N	1.182700000	2025-10-29 02:41:34.708035
6c88a150-30c7-4c43-a0d0-90e27d87418f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503300000	0.970000000	open	\N	1.013300000	2025-10-29 02:42:18.506496
621d6f34-8fa6-4986-bded-a400c24bcfd2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503300000	0.970000000	open	\N	1.013400000	2025-10-29 02:42:26.882325
8610ad02-02e2-43fb-9a12-5e1ac6eaba23	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.501500000	0.970000000	open	\N	1.006000000	2025-10-29 02:43:03.487219
705c9c47-463a-4cd8-8082-b16c899140aa	116eace9-841b-48fa-a7ec-d3249bb3aa80	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.503400000	9.660000000	open	\N	1.014300000	2025-10-29 02:43:22.664449
38616763-6897-4244-9843-af2209e7a631	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d56f2224-6c29-4110-8330-33dec782a2e2	YES	1.00	0.513300000	0.930000000	open	\N	1.054700000	2025-10-29 02:47:43.2069
bb75857d-b2ae-44b0-a3c0-e2b7b9cc4b78	781a2101-8dfc-480e-a185-69fab61df3cc	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	10.00	0.501500000	9.740000000	open	\N	1.006400000	2025-10-29 02:49:12.672837
1e5448fb-f964-40cc-bb48-dae541a256da	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503200000	0.970000000	open	\N	1.012700000	2025-10-29 02:41:49.758421
6b4bbd90-b7aa-4c25-98f4-8063be6b4086	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503200000	0.970000000	open	\N	1.012800000	2025-10-29 02:41:51.591907
d09f52a5-17ac-4845-9df7-4134d18d822b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503300000	0.970000000	open	\N	1.013100000	2025-10-29 02:42:06.218545
5df6eeb8-440c-4b22-a2ac-edc117e5e55b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503300000	0.970000000	open	\N	1.013200000	2025-10-29 02:42:14.068025
82840296-512b-490b-97b6-a4f8925e9308	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503300000	0.970000000	open	\N	1.013500000	2025-10-29 02:42:27.263813
c8af9b86-63d7-4e8d-8834-777d4fab404e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.501500000	0.970000000	open	\N	1.005900000	2025-10-29 02:42:29.252142
a9ab8eb5-ffb5-4ff6-a7e2-04bde22cde6a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.503400000	0.970000000	open	\N	1.013600000	2025-10-29 02:43:03.35972
c11459e6-e93b-4d4e-8164-c391483bc8e6	898e8852-e40d-4b2a-a8f7-3e215268febc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	100.00	0.496300000	98.960000000	open	\N	0.990300000	2025-10-29 02:43:30.676396
7876f556-076a-4d06-a98d-020de245b06c	116eace9-841b-48fa-a7ec-d3249bb3aa80	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.00	0.510200000	9.400000000	open	\N	1.042100000	2025-10-29 02:43:38.343885
fadb28e0-297a-4dd3-b157-eff8ac3b2596	e5275105-2102-4d2c-afda-0440b7afaab3	d56f2224-6c29-4110-8330-33dec782a2e2	NO	10.00	0.487400000	10.300000000	open	\N	0.951400000	2025-10-29 02:45:08.004963
037f1b17-40c8-4e7f-9e91-03575a9007bc	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d56f2224-6c29-4110-8330-33dec782a2e2	YES	9.45	0.512300000	9.000000000	settled	-0.200000000	\N	2025-10-29 02:46:44.938232
bcbc08f2-6a82-4ed8-b41a-eda2ef3e9be1	7c7bb616-dc44-412d-b05f-2c34fc58929b	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	100.00	0.513700000	92.320000000	open	\N	1.061500000	2025-10-29 02:47:03.225692
0ca50bfc-aa18-44d4-8123-62ec474e24f4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1.00	0.553100000	0.790000000	open	\N	1.237900000	2025-10-29 02:47:21.491454
c7cd54ff-233a-4273-9aac-09d719d5a4a8	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.501400000	0.970000000	open	\N	1.005900000	2025-10-29 02:47:30.738244
f4efb4bb-ae1a-4191-b0d7-04524f767728	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1.00	0.553200000	0.790000000	open	\N	1.238000000	2025-10-29 02:47:37.907613
c2a4a91d-ff04-4f0d-9701-6685f6905e40	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.505400000	0.960000000	open	\N	1.021900000	2025-10-29 02:47:43.774615
ef641307-327c-464f-a45f-358450ac272e	7c7bb616-dc44-412d-b05f-2c34fc58929b	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	100.00	0.553200000	78.810000000	open	\N	1.243500000	2025-10-29 02:48:36.090056
a1f444fb-4d5f-45b1-8ea6-907e8da65ec6	781a2101-8dfc-480e-a185-69fab61df3cc	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.513300000	9.290000000	open	\N	1.055200000	2025-10-29 02:48:36.235814
25d033c7-cc02-4a01-a98c-5cd1cfc51fb6	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.516100000	9.180000000	open	\N	1.067100000	2025-10-29 02:48:40.056299
8291e395-ab4e-41f5-9549-173d0bd4149f	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	10.00	0.505400000	9.580000000	open	\N	1.022500000	2025-10-29 02:48:42.783887
ce15857a-0b3e-4af5-899f-270f27e7e1f4	7c7bb616-dc44-412d-b05f-2c34fc58929b	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.511600000	93.100000000	open	\N	1.052600000	2025-10-29 02:48:48.3005
a198cfc0-5d14-473a-be11-ffe8518d9e24	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.516300000	9.180000000	open	\N	1.068100000	2025-10-29 02:48:49.80514
45a7afc8-526c-4c06-8a2d-418afad927d1	781a2101-8dfc-480e-a185-69fab61df3cc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.501500000	9.740000000	open	\N	1.006400000	2025-10-29 02:49:01.451543
c3802933-7041-4d7b-96d8-d64d54803aaf	781a2101-8dfc-480e-a185-69fab61df3cc	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.555600000	7.840000000	open	\N	1.250600000	2025-10-29 02:49:06.203013
0fc60ad4-26f2-442e-beaa-995b75c6f53a	781a2101-8dfc-480e-a185-69fab61df3cc	d827611b-bd78-4f00-a05c-b68859aefca5	YES	10.00	0.545000000	9.800000000	open	\N	1.000500000	2025-10-29 02:49:22.136738
9991d510-7ceb-4baa-b656-4e7780f032cb	781a2101-8dfc-480e-a185-69fab61df3cc	5eb75da5-3e9c-4ddf-a60a-8960dccb0ea0	YES	10.00	0.535000000	9.800000000	open	\N	1.000500000	2025-10-29 02:49:24.90129
4431426e-5a16-4403-97f9-8a8e927eee4d	781a2101-8dfc-480e-a185-69fab61df3cc	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	10.00	0.514200000	9.250000000	open	\N	1.059100000	2025-10-29 02:49:27.472838
ea565341-8cda-4346-ac6c-b573e3e111d7	781a2101-8dfc-480e-a185-69fab61df3cc	696b7e3f-44bb-408f-b490-482f4fb7bcc2	YES	10.00	0.477400000	10.720000000	open	\N	0.914000000	2025-10-29 02:49:28.326021
5b1e78fc-6c94-490d-808b-ea3b38ef5c30	781a2101-8dfc-480e-a185-69fab61df3cc	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	10.00	0.502400000	9.700000000	open	\N	1.010300000	2025-10-29 02:49:31.293978
8999bddc-af3a-4394-91e8-6542850a9247	781a2101-8dfc-480e-a185-69fab61df3cc	5ad16a19-1481-47b8-a791-69b314373c90	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:49:34.213918
50078f79-60e7-4bc9-9919-860b615d86f6	781a2101-8dfc-480e-a185-69fab61df3cc	d34373d6-1998-4d30-ad8b-86693941de64	YES	10.00	0.503700000	9.650000000	open	\N	1.015200000	2025-10-29 02:49:36.897707
340691f2-80b5-4d44-a07b-4a3ecb42a4d3	781a2101-8dfc-480e-a185-69fab61df3cc	c05312e8-40bf-42a8-a95e-443f391f6045	YES	10.00	0.502700000	9.690000000	open	\N	1.011300000	2025-10-29 02:49:40.658939
327b0016-4a38-46e4-b114-6479d45a8f5d	781a2101-8dfc-480e-a185-69fab61df3cc	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	10.00	0.498800000	9.840000000	open	\N	0.995600000	2025-10-29 02:49:42.876453
b2bae44e-65b7-4723-bcc3-4c27ba4e2f7c	781a2101-8dfc-480e-a185-69fab61df3cc	d5812241-a74a-4d80-81d3-eab0c8af3b5b	YES	10.00	0.510900000	9.380000000	open	\N	1.045100000	2025-10-29 02:49:46.462936
8654ec2e-205b-4e01-bd5b-a96748065d48	781a2101-8dfc-480e-a185-69fab61df3cc	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	10.00	0.500200000	9.790000000	open	\N	1.001500000	2025-10-29 02:49:49.896926
fc333c54-5d63-4f3e-bcf1-2ed06f18aec5	781a2101-8dfc-480e-a185-69fab61df3cc	5877484f-f8a2-41b8-8889-7bac69f1c993	YES	10.00	0.500200000	9.790000000	open	\N	1.001500000	2025-10-29 02:49:52.057517
2790a711-c3dc-427d-a839-a4d668ae1b87	781a2101-8dfc-480e-a185-69fab61df3cc	36d4b50a-987e-4b93-864b-aca00db121f7	YES	10.00	0.501700000	9.730000000	open	\N	1.007400000	2025-10-29 02:50:04.64338
6fb38996-08d0-47b2-b431-ce5c62cba05b	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.516600000	9.170000000	open	\N	1.069100000	2025-10-29 02:50:26.146617
4aaaf8f9-128e-4083-831a-5bcc3b3802eb	781a2101-8dfc-480e-a185-69fab61df3cc	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.513800000	9.270000000	open	\N	1.057200000	2025-10-29 02:50:30.153732
3850124f-7188-40dd-a1ce-72ddb094f67a	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	10.00	0.497800000	9.880000000	open	\N	0.991800000	2025-10-29 02:50:34.046339
db4e7aeb-9e33-44b7-948f-1847790c46cb	781a2101-8dfc-480e-a185-69fab61df3cc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.501700000	9.730000000	open	\N	1.007400000	2025-10-29 02:50:37.423053
35fc10a0-6b7a-480f-955a-10ca19afd0e0	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	10.00	0.505900000	9.570000000	open	\N	1.024500000	2025-10-29 02:50:40.5532
519ed339-837d-4961-a9f7-fefc929adc9d	781a2101-8dfc-480e-a185-69fab61df3cc	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.555800000	7.830000000	open	\N	1.251700000	2025-10-29 02:50:43.43119
97d68370-fd27-455b-bf9a-33ebd6507457	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	50.00	0.514500000	46.130000000	open	\N	1.062100000	2025-10-29 02:50:44.61822
b54cba5b-ba22-49b1-9cb2-1d543a97ef36	781a2101-8dfc-480e-a185-69fab61df3cc	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	1.00	0.499100000	0.980000000	open	\N	0.996300000	2025-10-29 02:56:10.227486
d8af1b49-8f32-4e49-a520-4d8f0e53a87e	781a2101-8dfc-480e-a185-69fab61df3cc	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	YES	10.00	0.504900000	9.610000000	open	\N	1.020200000	2025-10-29 02:50:53.391634
6ac0f5db-bb8f-4315-99dd-0b439c9d65b0	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	1.00	0.510200000	0.940000000	open	\N	1.041800000	2025-10-29 02:53:43.336048
2aec9d34-3e2d-42c8-9aab-2f75fd04a9cb	781a2101-8dfc-480e-a185-69fab61df3cc	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	1.00	0.515700000	0.920000000	open	\N	1.064700000	2025-10-29 02:55:03.23601
f78be5a3-1c72-40c8-a036-a713c74c48d8	781a2101-8dfc-480e-a185-69fab61df3cc	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	1.00	0.500500000	0.980000000	open	\N	1.002000000	2025-10-29 02:56:04.071028
b46f1693-5e58-4538-8a3a-57397282e1e4	781a2101-8dfc-480e-a185-69fab61df3cc	ad076954-b6fe-487f-aa79-8c2cbfdb62e4	YES	1.00	0.500200000	0.980000000	open	\N	1.001000000	2025-10-29 02:56:18.632244
04474327-fa53-47d2-aaa5-1d890595c4c1	781a2101-8dfc-480e-a185-69fab61df3cc	af62438b-0dfd-4b7e-921a-c65249b9514b	YES	10.00	0.501200000	9.750000000	open	\N	1.005400000	2025-10-29 02:50:56.701975
9dadbc43-d697-48ca-a4d8-9aa51d6750ad	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	1.00	0.516800000	0.920000000	open	\N	1.069600000	2025-10-29 02:55:02.99669
e9019c3b-117b-40fc-9e5e-e92319f9176d	781a2101-8dfc-480e-a185-69fab61df3cc	36d4b50a-987e-4b93-864b-aca00db121f7	YES	1.00	0.502000000	0.970000000	open	\N	1.007900000	2025-10-29 02:55:51.033883
5a1e4a0d-7a7e-4193-b92a-74e4ecbf9279	781a2101-8dfc-480e-a185-69fab61df3cc	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	1.00	0.499000000	0.980000000	open	\N	0.996200000	2025-10-29 02:55:55.699479
db9fc883-691f-4d18-86be-c6ccb76b1fae	781a2101-8dfc-480e-a185-69fab61df3cc	51fbe44c-ea10-43ad-ab46-37722bbe1409	YES	10.00	0.530000000	9.800000000	open	\N	1.000500000	2025-10-29 02:51:00.241611
38c8776f-8251-48ee-9a79-5417ff4abc5b	781a2101-8dfc-480e-a185-69fab61df3cc	ae59057f-cbc0-4ee4-b623-257f78296ba4	YES	10.00	0.500200000	9.790000000	open	\N	1.001500000	2025-10-29 02:51:02.371214
2aa747c1-07c8-4262-85b7-355c4d3f428c	781a2101-8dfc-480e-a185-69fab61df3cc	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	10.00	0.499400000	9.820000000	open	\N	0.997900000	2025-10-29 02:51:04.938262
02fe5f3d-9515-4675-b9ae-d75650c86544	781a2101-8dfc-480e-a185-69fab61df3cc	e6ce6e2c-77ed-4fd4-9687-23b604290619	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:51:07.383918
c78a07bb-2577-4cd2-9153-84196d2886c7	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	50.00	0.502700000	48.360000000	open	\N	1.013300000	2025-10-29 02:51:09.403429
8e29f737-82e9-442d-9e8a-ef8e3812a8d5	781a2101-8dfc-480e-a185-69fab61df3cc	12234807-e884-47ca-bf2c-e96e2d3ab1b4	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:51:10.90737
530e11c3-f4ba-4423-9faf-1dbea6964fb0	781a2101-8dfc-480e-a185-69fab61df3cc	153ca650-c833-4e43-8821-9df7b757ec29	YES	10.00	0.500000000	9.800000000	open	\N	1.000500000	2025-10-29 02:51:14.913413
85f121c0-2ab6-4026-ba4e-f3ee77b6af65	781a2101-8dfc-480e-a185-69fab61df3cc	5b4c6405-94b6-4e20-a87b-c5ec6256786f	YES	10.00	0.500200000	9.790000000	open	\N	1.001500000	2025-10-29 02:51:29.10093
acccf8f3-2d26-4f0d-9c24-5cbfe5a49e06	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	500.00	0.498100000	481.930000000	open	\N	1.016700000	2025-10-29 02:52:33.881304
03c49612-6c66-46ca-b69c-bbb26b98b134	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.511000000	0.940000000	open	\N	1.044900000	2025-10-29 02:53:54.401129
2beaf310-9e15-4702-bc93-346d79403c0a	c37781bb-d03a-4b8f-aa8b-972ee268014a	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	100.00	0.510200000	93.610000000	open	\N	1.046800000	2025-10-29 02:54:16.643174
b2f0d3c5-b41c-4f0e-b922-0f80afd26e2c	c37781bb-d03a-4b8f-aa8b-972ee268014a	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	50.00	0.498300000	49.220000000	open	\N	0.995600000	2025-10-29 02:54:26.243662
f2b04a30-2070-4a78-9eb8-8d41655491a5	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	1.00	0.512600000	0.930000000	open	\N	1.051900000	2025-10-29 02:54:36.891252
9c8276a2-56ca-474e-9ba3-0922a24fbadd	c37781bb-d03a-4b8f-aa8b-972ee268014a	d56f2224-6c29-4110-8330-33dec782a2e2	YES	500.00	0.514000000	452.480000000	open	\N	1.082900000	2025-10-29 02:54:37.04328
3cbde66d-b3b8-493c-9740-488145ecf480	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.511000000	0.940000000	open	\N	1.045000000	2025-10-29 02:54:41.524197
4b04acd7-c481-4b44-b812-c069c789f831	781a2101-8dfc-480e-a185-69fab61df3cc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.511900000	0.930000000	open	\N	1.048800000	2025-10-29 02:54:45.097476
eab801eb-fcb9-4896-9757-24061c9fa3b3	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	1.00	0.512700000	0.930000000	open	\N	1.052000000	2025-10-29 02:54:49.353844
c9d7bf5c-ac45-4513-8fb1-db816ef4638c	781a2101-8dfc-480e-a185-69fab61df3cc	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1.00	0.556000000	0.780000000	open	\N	1.252300000	2025-10-29 02:54:52.426147
3d343c90-e502-401b-be35-36ecbb3f88e1	c37781bb-d03a-4b8f-aa8b-972ee268014a	c05312e8-40bf-42a8-a95e-443f391f6045	YES	50.00	0.502900000	48.310000000	open	\N	1.014300000	2025-10-29 02:54:58.62236
5c2609f0-c526-445f-9615-21d7c9254f82	781a2101-8dfc-480e-a185-69fab61df3cc	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	1.00	0.515700000	0.920000000	open	\N	1.064800000	2025-10-29 02:55:13.141057
6384388d-112d-4307-9fb6-3d868fdd6bae	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	1.00	0.511000000	0.940000000	open	\N	1.045100000	2025-10-29 02:55:21.307591
97178ad9-d2c1-4292-af91-42ba8ec4892f	781a2101-8dfc-480e-a185-69fab61df3cc	d34373d6-1998-4d30-ad8b-86693941de64	YES	1.00	0.503900000	0.960000000	open	\N	1.015800000	2025-10-29 02:55:24.312041
54303d61-c52d-41b3-ab24-53df52524f7b	781a2101-8dfc-480e-a185-69fab61df3cc	5ad16a19-1481-47b8-a791-69b314373c90	YES	1.00	0.500200000	0.980000000	open	\N	1.001000000	2025-10-29 02:55:39.499296
2efe8ce7-6290-4867-8736-4ba9a611fe0d	781a2101-8dfc-480e-a185-69fab61df3cc	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	1.00	0.499000000	0.980000000	open	\N	0.996100000	2025-10-29 02:55:43.102542
34bb56b8-0d50-43aa-bf8f-daceeb51fa5a	781a2101-8dfc-480e-a185-69fab61df3cc	d5812241-a74a-4d80-81d3-eab0c8af3b5b	YES	1.00	0.511100000	0.940000000	open	\N	1.045600000	2025-10-29 02:55:47.243214
96467dc1-2f71-4082-a42c-4f9b2ee56a10	781a2101-8dfc-480e-a185-69fab61df3cc	c05312e8-40bf-42a8-a95e-443f391f6045	YES	1.00	0.504200000	0.960000000	open	\N	1.016900000	2025-10-29 02:55:59.769549
3557b692-2038-49ee-8c67-079d325fd0ee	781a2101-8dfc-480e-a185-69fab61df3cc	76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	YES	1.00	0.500200000	0.980000000	open	\N	1.001000000	2025-10-29 02:56:15.873454
8f719e09-63b0-4377-b650-13b8a158fed7	781a2101-8dfc-480e-a185-69fab61df3cc	621f98b0-89ea-49de-8d53-e80a7df36042	YES	10.00	0.502400000	9.700000000	open	\N	1.010300000	2025-10-29 02:51:18.456451
171a1fc1-4335-4b8f-a14b-37086dffca3a	781a2101-8dfc-480e-a185-69fab61df3cc	0ae16313-0efe-4dd3-bc92-ca8bf2246903	YES	10.00	0.501200000	9.750000000	open	\N	1.005400000	2025-10-29 02:51:23.697983
cba3a323-a894-45d2-bc9c-8b3b7365f0f1	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	e1564a37-b27e-4380-a2b2-8054ff5ac4e3	NO	100.00	0.499800000	97.620000000	open	\N	1.003900000	2025-10-29 02:51:46.416321
206db6ed-eff4-4ca1-8621-954924e85849	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	0ae16313-0efe-4dd3-bc92-ca8bf2246903	NO	100.00	0.498500000	98.100000000	open	\N	0.999000000	2025-10-29 02:52:21.019953
21b11856-9130-493f-a954-282950d99781	116eace9-841b-48fa-a7ec-d3249bb3aa80	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	410.00	0.502000000	390.840000000	open	\N	1.028000000	2025-10-29 02:52:44.875478
9288bec2-5875-4c53-a470-f6c710887ad3	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	de9f0b13-259c-495c-8497-072ec8d45331	YES	200.00	0.506200000	189.400000000	open	\N	1.034900000	2025-10-29 02:52:49.02087
318c90d7-7863-4906-a4ce-26203f463ae5	781a2101-8dfc-480e-a185-69fab61df3cc	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	1.00	0.500500000	0.980000000	open	\N	1.002000000	2025-10-29 02:54:31.714119
a7248731-0f5e-4ddf-8115-676230370311	781a2101-8dfc-480e-a185-69fab61df3cc	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	1.00	0.514200000	0.930000000	open	\N	1.058700000	2025-10-29 02:55:00.618353
9422d1a4-aedc-4fae-bf17-d46b90af3ec1	781a2101-8dfc-480e-a185-69fab61df3cc	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	1.00	0.500500000	0.980000000	open	\N	1.002100000	2025-10-29 02:55:06.738737
5998ae1d-07ef-4715-9985-e289a00fe343	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	1.00	0.516800000	0.920000000	open	\N	1.069700000	2025-10-29 02:55:23.860572
9d800953-1dd6-4cae-81dc-00877c98a203	781a2101-8dfc-480e-a185-69fab61df3cc	c05312e8-40bf-42a8-a95e-443f391f6045	YES	1.00	0.504100000	0.960000000	open	\N	1.016800000	2025-10-29 02:55:26.505719
cd4226cc-af96-40fe-a1a4-be042e2fb0a2	781a2101-8dfc-480e-a185-69fab61df3cc	d827611b-bd78-4f00-a05c-b68859aefca5	YES	1.00	0.500200000	0.980000000	open	\N	1.001000000	2025-10-29 02:55:29.232578
e27da32c-3444-4600-b2de-6c7477cfc35d	781a2101-8dfc-480e-a185-69fab61df3cc	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	1.00	0.503900000	0.960000000	open	\N	1.015800000	2025-10-29 02:56:07.63851
219ed51c-75dc-4127-b69f-537835398219	781a2101-8dfc-480e-a185-69fab61df3cc	34a0781e-cde7-4eec-ac89-fdad71893214	YES	10.00	0.501200000	9.750000000	open	\N	1.005400000	2025-10-29 02:51:26.274625
fc2f8680-f619-4376-bb22-f3eaa4fcc973	781a2101-8dfc-480e-a185-69fab61df3cc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	1.00	0.511900000	0.930000000	open	\N	1.048700000	2025-10-29 02:53:46.246157
85dab448-a427-407b-89d2-97f99f87ecb8	781a2101-8dfc-480e-a185-69fab61df3cc	36d4b50a-987e-4b93-864b-aca00db121f7	YES	1.00	0.502000000	0.970000000	open	\N	1.008000000	2025-10-29 02:56:21.016645
544f9435-6dd9-4d9e-8b83-b428b0d43c83	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	500.00	0.511900000	456.280000000	open	\N	1.073900000	2025-10-29 02:56:24.423023
839cb9e7-9be4-4acd-a72a-4a70d117b7fb	6b9280e2-476c-430b-9470-05ee75118ac6	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	50.00	0.500500000	48.780000000	open	\N	1.004500000	2025-10-29 02:58:21.025568
b125bd1d-454f-4e40-ad5a-0e7fcf27fd58	6b9280e2-476c-430b-9470-05ee75118ac6	de9f0b13-259c-495c-8497-072ec8d45331	NO	50.00	0.489000000	51.090000000	open	\N	0.959200000	2025-10-29 02:59:52.735723
5c28b328-85fc-4020-bb59-66ce21be06da	6b9280e2-476c-430b-9470-05ee75118ac6	5ad16a19-1481-47b8-a791-69b314373c90	YES	50.00	0.500300000	48.830000000	open	\N	1.003500000	2025-10-29 03:00:20.946669
36c0f3b3-22ee-4536-b12a-c80a473f64d6	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	0.10	0.512700000	0.090000000	open	\N	1.052100000	2025-10-29 03:00:28.198235
8acb5fd9-3b3e-418d-8f74-f6d94ec31e88	6b9280e2-476c-430b-9470-05ee75118ac6	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	50.00	0.500200000	48.830000000	open	\N	1.003400000	2025-10-29 03:00:53.175139
e8678d4e-4007-49b8-a273-4de7c78deb98	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d56f2224-6c29-4110-8330-33dec782a2e2	NO	50.00	0.474200000	54.190000000	open	\N	0.904300000	2025-10-29 03:00:58.5619
7dca2672-cfb1-47d5-965b-d4e11c41cb42	986f6e58-f06f-4981-a9a6-4d721e24cd15	de9f0b13-259c-495c-8497-072ec8d45331	YES	100.00	0.509800000	93.780000000	open	\N	1.045000000	2025-10-29 03:01:09.699077
89cdbb83-12a6-4859-91eb-0b0d71777e29	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	100.00	0.499500000	97.730000000	open	\N	1.002800000	2025-10-29 03:01:11.933294
e5c6c3a9-e589-494a-bbf4-e6a2f0a39cdd	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.524500000	8.880000000	open	\N	1.103500000	2025-10-29 03:02:47.949737
b61d0885-bb44-4f90-b09d-71bc8ee341c3	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	10.00	0.498100000	9.870000000	open	\N	0.992900000	2025-10-29 03:02:51.494756
268b6bce-5a5b-420d-af89-b4ce2bed7b1f	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.556000000	7.820000000	open	\N	1.252900000	2025-10-29 03:02:58.088387
bb07a53e-ba75-47e2-ab14-84271ee02b0b	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.524700000	8.870000000	open	\N	1.104600000	2025-10-29 03:03:01.594455
f1ec7a0d-c0c4-454f-8a44-76239b8ad852	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	de9f0b13-259c-495c-8497-072ec8d45331	YES	50.00	0.512200000	46.560000000	open	\N	1.052500000	2025-10-29 03:03:06.443384
8b927384-736b-4f82-888f-2e106af71fa5	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.516900000	9.160000000	open	\N	1.070300000	2025-10-29 03:03:59.973197
fbaee9c9-eef2-4e03-afa9-4053833c4537	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d827611b-bd78-4f00-a05c-b68859aefca5	YES	10.00	0.500300000	9.780000000	open	\N	1.001600000	2025-10-29 03:04:03.219266
c2dda7d4-cae9-48d9-b09d-b071ddd8967d	0630514b-c953-4b9c-bea4-1fbe518040ef	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	10.00	0.498300000	9.860000000	open	\N	0.993800000	2025-10-29 03:07:06.360712
82d1cd1e-22e8-48bf-b430-752ac83df6b4	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	10.00	0.501500000	9.740000000	open	\N	1.006400000	2025-10-29 03:17:49.546375
ddc5de9b-a0e5-4667-850f-6df6e259ece1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	5ad16a19-1481-47b8-a791-69b314373c90	NO	10.00	0.498500000	9.850000000	open	\N	0.994500000	2025-10-29 03:17:55.972688
e209bb37-afcd-4657-bbc8-99b77f161bf1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d34373d6-1998-4d30-ad8b-86693941de64	YES	10.00	0.503900000	9.640000000	open	\N	1.016300000	2025-10-29 03:17:57.264503
304ab82a-f7bb-46d9-a7a1-92ac1bdb37a2	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d30c9b38-20d5-4921-9666-2efdd14c2a6a	NO	500.00	0.500900000	476.580000000	open	\N	1.028200000	2025-10-29 03:18:11.695635
90af1fcb-af6f-469f-8f3c-4a43e9853a7b	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	36d4b50a-987e-4b93-864b-aca00db121f7	YES	50.00	0.502000000	48.490000000	open	\N	1.010500000	2025-10-29 03:18:17.652249
3c2bc84f-19a8-42f0-b71a-85ce142bb6f0	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	159.00	0.482900000	165.520000000	open	\N	0.941400000	2025-10-29 03:18:44.804067
8d4f6595-c9c8-4835-ba74-d0f1f096bf5d	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	0.90	0.486900000	0.930000000	open	\N	0.949000000	2025-10-29 03:18:55.099908
1b3a6fc7-ab05-4423-a454-888d9adde5f6	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	500.00	0.443800000	597.820000000	open	\N	0.819700000	2025-10-29 03:27:58.106749
e07b615f-c169-470d-9834-36fe79b23c75	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.542800000	8.250000000	open	\N	1.188000000	2025-10-29 03:37:52.616851
108e9c22-63bb-45da-a5d0-fd53006c07bd	477a8b79-e143-4a9d-9973-a8cddae67200	d56f2224-6c29-4110-8330-33dec782a2e2	YES	100.00	0.525000000	88.270000000	open	\N	1.110200000	2025-10-29 03:40:10.830967
8bf8b9eb-af1a-4332-9013-c8f362054883	477a8b79-e143-4a9d-9973-a8cddae67200	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	100.00	0.487000000	102.710000000	open	\N	0.954200000	2025-10-29 03:41:05.525324
e40a31a3-39fc-4a8a-9e70-e7ca4e22b317	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	50.00	0.543100000	41.140000000	open	\N	1.191200000	2025-10-29 04:21:07.408029
c15ac404-1331-425a-a3f1-bf15ef1911d4	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.513100000	9.300000000	open	\N	1.054200000	2025-10-29 04:28:29.304243
0150206a-0bb3-4624-8fc1-b6fd7ea9c82b	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	500.00	0.501700000	475.060000000	open	\N	1.031500000	2025-10-29 05:20:24.616651
dbd0b202-cca6-4255-a149-eee18bdb6f78	bd56d08d-5742-46cd-bc48-fb65d8d58111	d56f2224-6c29-4110-8330-33dec782a2e2	NO	10.00	0.472700000	10.930000000	open	\N	0.897000000	2025-10-29 05:46:05.291861
b23a2090-6c97-4929-92b3-1578dee24b2c	97c3ead3-ae64-4a29-89da-5d5006dcbf43	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.513300000	9.290000000	open	\N	1.055200000	2025-10-29 05:51:40.778858
d7760717-5afb-4fc9-b78a-f85d08da9b32	f166a726-47ab-404b-9555-16a114a5cb89	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	10.00	0.513500000	9.280000000	open	\N	1.056200000	2025-10-29 07:31:19.018114
583d2ae0-98b0-49bc-8615-0586b78dd61b	4cfa95be-699c-4019-b7e7-873475ad0fc5	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	100.00	0.455800000	116.380000000	open	\N	0.842100000	2025-10-29 08:23:11.686938
6de75f12-bfab-41f9-b267-02264af71401	23144889-a854-43a5-ada7-d9cb5abc31f0	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	500.00	0.541500000	405.690000000	open	\N	1.207800000	2025-10-29 09:03:43.99827
cc2b903d-f564-4375-9ddb-9cd7074849c9	088deaa4-8a69-4d01-ac4c-a00a67444efc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	50.00	0.513800000	46.260000000	open	\N	1.059200000	2025-10-29 09:56:20.06679
dcebecbc-3e87-4559-ba4c-b80e578afb8f	a85fd10a-3ea5-4f11-9740-799d19224b70	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	10.00	0.485000000	10.400000000	open	\N	0.942400000	2025-10-29 10:06:38.010582
0556b6c7-972c-4e15-b8ed-bd6cbb9f374b	a85fd10a-3ea5-4f11-9740-799d19224b70	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	50.00	0.447400000	60.350000000	open	\N	0.811900000	2025-10-29 10:07:40.265178
bae2abc1-9662-4c9d-94eb-cc888fb1fea7	ae6cf106-8d94-4ca6-9e85-8165196a9011	d56f2224-6c29-4110-8330-33dec782a2e2	YES	500.00	0.527000000	429.780000000	open	\N	1.140100000	2025-10-29 10:33:06.215488
636b1c60-0783-461d-adf5-2d16b5857789	ae6cf106-8d94-4ca6-9e85-8165196a9011	d56f2224-6c29-4110-8330-33dec782a2e2	YES	400.00	0.538400000	330.030000000	open	\N	1.187800000	2025-10-29 10:33:36.913385
f00dc045-d18c-48a7-80bf-f62e835b53a7	9e1c1b26-c03b-4319-9e39-e477f314e814	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	100.00	0.514700000	91.960000000	open	\N	1.065700000	2025-10-29 11:12:41.895922
ef60dee5-b4fc-4748-8761-f78d9bbe7ca0	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.551200000	7.970000000	open	\N	1.228900000	2025-10-29 11:14:00.210629
42a06248-2f82-4fc6-809e-cf61818d9e1e	9e1c1b26-c03b-4319-9e39-e477f314e814	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	50.00	0.485700000	51.750000000	open	\N	0.946900000	2025-10-29 11:14:08.730481
03fc95e6-73ea-4f46-adba-295fca89485e	9e1c1b26-c03b-4319-9e39-e477f314e814	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	500.00	0.515700000	449.480000000	open	\N	1.090100000	2025-10-29 11:14:53.255458
4708dd12-4e65-418b-9b3e-e3a4144bcc3b	9e1c1b26-c03b-4319-9e39-e477f314e814	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	100.00	0.501400000	96.970000000	open	\N	1.010600000	2025-10-29 11:15:47.216149
9840f628-0d94-4658-b5f8-0a485189f5b4	9e1c1b26-c03b-4319-9e39-e477f314e814	5ad16a19-1481-47b8-a791-69b314373c90	YES	100.00	0.501200000	97.040000000	open	\N	1.009900000	2025-10-29 11:16:24.316791
138d147a-4ef1-4617-955a-9e6020d8eb36	6f37eec8-c479-419d-bc02-5dc6064b7e2e	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	10.00	0.551500000	7.970000000	open	\N	1.230000000	2025-10-29 11:29:06.003602
faaba100-7814-4949-a93d-7460976d24cb	477a8b79-e143-4a9d-9973-a8cddae67200	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.513000000	92.590000000	open	\N	1.058500000	2025-10-29 11:37:25.282335
933e0a35-f439-4952-b032-6c405218b6f3	477a8b79-e143-4a9d-9973-a8cddae67200	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	100.00	0.496100000	99.040000000	open	\N	0.989500000	2025-10-29 11:38:13.859129
4991170c-40c8-4ef9-a56f-2a7a5c5ba58a	477a8b79-e143-4a9d-9973-a8cddae67200	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	100.00	0.512700000	92.710000000	open	\N	1.057100000	2025-10-29 11:38:58.835306
bfd18f1e-ab7c-4f3d-9a54-f6936d5e9faf	9095d825-361c-47f5-a10d-1aa6f559f7f5	7a6658de-1c31-445c-90e0-370fc3977773	YES	500.00	0.501200000	475.970000000	open	\N	1.029500000	2025-10-29 11:45:04.774157
8817ea4b-500c-437f-b2ea-6aa58398b27b	32735788-8647-4ccc-9ecb-54f45a69e878	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	10.00	0.498600000	9.850000000	open	\N	0.994900000	2025-10-29 13:41:02.65781
31faa8d6-a7c7-474a-9807-aba050252492	64b0f2e4-508c-4efa-8b39-0b3569451567	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	213.00	0.484600000	219.640000000	open	\N	0.950400000	2025-10-29 15:08:57.543938
851db082-b0d0-4aea-b297-ce06aca8820d	5f8d475c-cbf4-4590-93f9-490db5f1eb48	d56f2224-6c29-4110-8330-33dec782a2e2	YES	50.00	0.547400000	40.430000000	open	\N	1.212000000	2025-10-29 15:43:46.835772
baa918d2-b20a-40e7-9ee4-8379126a3fb8	9e1c1b26-c03b-4319-9e39-e477f314e814	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	100.00	0.510000000	93.690000000	open	\N	1.046000000	2025-10-29 15:56:51.115452
760e431b-fac8-4832-9e6f-f6f9c89a8229	9e1c1b26-c03b-4319-9e39-e477f314e814	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	50.00	0.476300000	53.740000000	open	\N	0.911800000	2025-10-29 15:59:36.831822
b82a6466-9a38-4598-8a0f-da07f79f315b	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	500.00	0.522400000	437.660000000	open	\N	1.119600000	2025-10-29 16:03:51.807047
5e4c5ade-47fd-43b5-b5a8-58d4be893625	f166a726-47ab-404b-9555-16a114a5cb89	d56f2224-6c29-4110-8330-33dec782a2e2	YES	10.00	0.548500000	8.060000000	open	\N	1.215200000	2025-10-29 17:10:22.808056
587a53fa-2811-4120-a517-b8f032cd77ee	74923495-465e-44cc-9609-5c8a1ed982ba	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	50.00	0.551700000	39.730000000	open	\N	1.233200000	2025-10-29 17:18:26.875435
cbbb2245-9d21-44e8-859a-f1992a351a8f	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	50.00	0.515100000	46.020000000	open	\N	1.064700000	2025-10-29 18:24:55.982937
03dea7da-08fe-4c45-b6b3-cb54bbcbf209	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	d56f2224-6c29-4110-8330-33dec782a2e2	NO	100.00	0.451300000	118.510000000	open	\N	0.827000000	2025-10-29 18:36:00.012338
3c7d1755-5bff-4bfc-8388-b610c319034e	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	100.00	0.487600000	102.480000000	open	\N	0.956200000	2025-10-29 18:38:16.639003
9299db3c-9acc-4cf5-9057-ced39c799e31	df9311d2-24d6-4018-9afb-e9d114f142c2	c4fadc68-4591-44c1-ae46-2b92182aaad6	NO	500.00	0.763200000	478.280000000	open	\N	1.024500000	2025-10-29 19:00:28.028655
48a9d37a-12e7-45f6-8284-a6b680f9afa9	27432bf0-e96a-4136-88ed-fe24815881e6	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	10.00	0.534000000	8.550000000	open	\N	1.146300000	2025-10-29 20:03:56.523011
5ff9e940-0e82-4951-b564-af414b916471	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	500.00	0.482900000	511.700000000	open	\N	0.957600000	2025-10-29 21:02:59.766761
14518425-569e-4816-8934-b390ad9ee1d5	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	ae59057f-cbc0-4ee4-b623-257f78296ba4	NO	500.00	0.499500000	479.210000000	open	\N	1.022500000	2025-10-29 21:06:16.46989
3894b32a-4dab-4b04-b94d-14ddfb3ec265	78692077-9972-4fc9-9757-92e393af4830	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.00	0.509900000	9.410000000	open	\N	1.041000000	2025-10-29 21:24:13.681935
f0314549-ef80-4835-80c6-47321101b76d	8c3fd324-9419-40fc-ab4d-22229b75b911	de9f0b13-259c-495c-8497-072ec8d45331	NO	100.00	0.486600000	102.870000000	open	\N	0.952600000	2025-10-29 21:28:43.27474
a54174e5-b4b1-4e2d-a66b-df01d7cf7928	e373c930-5e25-404b-a36b-0faf910436a3	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	800.00	0.534200000	659.460000000	open	\N	1.188800000	2025-10-29 21:49:10.215989
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, user_id, market_id, content, created_at) FROM stdin;
ef10fe48-f3a1-4361-b414-b745f2dbe294	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	21649439-df19-49a7-bd15-18cb5f39aeb9	love u letterbomb but im voting no	2025-10-29 01:48:11.390352
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, user1_id, user2_id, last_message_at, created_at) FROM stdin;
fd0394cb-f998-40b3-99e5-ced8395aba1f	2a5a8384-d652-42e3-bed1-b03545d35725	72f9d3d2-355d-4f07-908e-5f6187afb864	2025-10-28 15:11:06.256471	2025-10-28 15:11:06.256471
49be8e53-f521-4232-8fab-db60c371ea8f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0238327d-15b3-41ae-b52c-cf223ee9832c	2025-10-29 02:31:04.901953	2025-10-29 02:31:04.901953
f1927021-9d4b-491a-9b59-e30726e80d52	af68e352-8fe4-41f7-bae1-e6fe20d5dbb2	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	2025-10-29 13:23:02.915	2025-10-29 13:23:01.143379
ec311564-dc60-40c1-a040-fcf785e17961	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	fe14c16f-74c4-4e1b-8d80-59963f550d0a	2025-10-29 18:23:03.689017	2025-10-29 18:23:03.689017
745c2be1-4fd4-4d43-8943-7ffb8d32d5b2	3a5ef17d-4776-4607-9577-75f70d4027e4	27432bf0-e96a-4136-88ed-fe24815881e6	2025-10-29 20:11:39.514	2025-10-29 20:11:34.901804
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.faqs (id, question, answer, category, "order", created_at, updated_at) FROM stdin;
a8b35d14-063e-4a54-a5a4-b6320a068170	What is KOL Market?	KOL Market is a prediction market platform where you can bet on the performance of Key Opinion Leaders (KOLs). Trade on outcomes related to follower growth, engagement rates, and other social media metrics.	getting_started	1	2025-10-27 00:02:21.302782	2025-10-27 00:02:21.302782
7b723279-9bb5-47b2-b386-f22cd50c01f0	How do I place a bet?	Browse the available markets on the home page. Click on a market you're interested in, choose YES or NO position, enter your bet amount, and click Buy. Your bet will be placed immediately.	betting	2	2025-10-27 00:02:21.325884	2025-10-27 00:02:21.325884
d4808396-68d9-4f0e-b18d-304af1a1bcc9	What are YES and NO positions?	When you buy YES, you're betting that the market outcome will be true. When you buy NO, you're betting it will be false. Prices adjust based on supply and demand using an automated market maker.	betting	3	2025-10-27 00:02:21.347065	2025-10-27 00:02:21.347065
c86b5779-20b3-4ff2-b60f-0b2477592098	How does pricing work?	Markets use a constant product automated market maker (AMM). Prices adjust dynamically based on betting activity. The more people bet on one side, the more expensive that position becomes.	betting	4	2025-10-27 00:02:21.367742	2025-10-27 00:02:21.367742
a368f2c1-7bf6-4307-8ffc-849ccd33870e	When do markets resolve?	Each market has a resolution date. Markets automatically resolve based on real KOL data scraped from kolscan.io. Winners receive 1 PTS per share, while losers receive nothing.	betting	5	2025-10-27 00:02:21.388303	2025-10-27 00:02:21.388303
c17408b1-6be7-47c1-8975-6ff08ed58990	What is the platform fee?	We charge a 2% fee on buy orders to maintain the platform and ensure liquidity. There are no fees on sell orders.	betting	6	2025-10-27 00:02:21.410513	2025-10-27 00:02:21.410513
c398d45b-8f8d-4f19-a40f-84d1d5e33433	Can I sell my position before resolution?	Yes! You can sell your shares at any time before the market resolves. The sell price depends on current market conditions and may be higher or lower than your purchase price.	betting	7	2025-10-27 00:02:21.430739	2025-10-27 00:02:21.430739
9c9778fb-67a9-494c-8b24-10da09a20780	How do I deposit SOL?	Go to the Wallet page and connect your Solana wallet. You'll receive a unique deposit address. Send SOL to this address and it will be credited to your account after confirmation.	technical	8	2025-10-27 00:02:21.453374	2025-10-27 00:02:21.453374
b9947d8b-dffa-41e2-a9b7-ecd9553a39c4	How do I withdraw SOL?	Go to the Wallet page, enter your destination Solana address and withdrawal amount, then submit. Withdrawals are processed automatically within minutes.	technical	9	2025-10-27 00:02:21.474916	2025-10-27 00:02:21.474916
1f1d55eb-590b-4f06-b6e2-01f449d4e95d	What are KOLs?	KOLs (Key Opinion Leaders) are influential figures on social media. We track their performance metrics like follower count, engagement rate, and trading success on kolscan.io.	kols	10	2025-10-27 00:02:21.4968	2025-10-27 00:02:21.4968
\.


--
-- Data for Name: follower_cache; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.follower_cache (id, x_handle, followers, cached_at) FROM stdin;
\.


--
-- Data for Name: forum_comment_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_comment_votes (id, comment_id, user_id, vote_type, created_at) FROM stdin;
\.


--
-- Data for Name: forum_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_comments (id, thread_id, user_id, content, parent_id, upvotes, downvotes, created_at, updated_at) FROM stdin;
a17e4bc2-8505-44ae-9974-e96b766d30be	6a0730f8-ef5f-4587-9d27-b1cb0afe86af	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	hello kurwa bobr	\N	0	0	2025-10-29 01:02:44.667905	2025-10-29 01:02:44.667905
85ed6958-1ebe-456c-ba41-dd7b026c8dc9	e000aaff-6652-4db6-bf74-78163dfc03d7	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	bobr	\N	0	0	2025-10-29 01:02:50.417324	2025-10-29 01:02:50.417324
e21c5691-3163-4774-8b6d-75e22054dfa1	412d081d-2e3a-4dbc-91f0-ace02023237b	c37781bb-d03a-4b8f-aa8b-972ee268014a	yo	\N	0	0	2025-10-29 03:00:35.024019	2025-10-29 03:00:35.024019
\.


--
-- Data for Name: forum_thread_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_thread_votes (id, thread_id, user_id, vote_type, created_at) FROM stdin;
70c1fe8a-546b-4b3a-bd39-fa8e951a18a9	6a0730f8-ef5f-4587-9d27-b1cb0afe86af	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	up	2025-10-29 00:25:23.939253
8d18120b-70c0-44b6-a499-fc2186bc6bdd	6a0730f8-ef5f-4587-9d27-b1cb0afe86af	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	up	2025-10-29 01:02:35.171839
5795a701-2228-4195-af29-7b878edd75e9	6a0730f8-ef5f-4587-9d27-b1cb0afe86af	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	up	2025-10-29 02:59:51.814286
9379d3fa-2fcc-4d14-9ac5-47bafb7ff946	5d6f893e-b8b4-4d66-823e-847ef9b010e6	7d3915cf-5ece-4c2c-9e67-8f4589cf6948	up	2025-10-29 15:11:17.18243
32e34b15-9c39-48b2-af8f-e0a0fbe1f5c1	fa735a5e-a539-48cf-bc41-f0a3f64b4fbe	df9311d2-24d6-4018-9afb-e9d114f142c2	up	2025-10-29 18:58:03.081068
\.


--
-- Data for Name: forum_threads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_threads (id, user_id, title, content, category, upvotes, downvotes, comments_count, is_pinned, is_locked, created_at, updated_at) FROM stdin;
e000aaff-6652-4db6-bf74-78163dfc03d7	ae103b3c-782b-444c-afe1-c8821379980a	ssdfsf	sfgsfg	general	0	0	1	f	f	2025-10-29 00:35:09.499318	2025-10-29 01:02:50.425
6a0730f8-ef5f-4587-9d27-b1cb0afe86af	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	Pumpfun Stream	Check us out!	general	3	0	1	f	f	2025-10-29 00:25:22.278094	2025-10-29 01:02:44.678
412d081d-2e3a-4dbc-91f0-ace02023237b	c37781bb-d03a-4b8f-aa8b-972ee268014a	add KOL	https://x.com/FR0STO_	kols	0	0	1	f	f	2025-10-29 02:10:27.813381	2025-10-29 03:00:35.044
ac768ed9-4e3e-4759-b4f0-d0b0f7f316f6	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	LFG	Great project, been here from beginning	general	0	0	0	f	f	2025-10-29 03:02:23.696755	2025-10-29 03:02:23.696755
5d6f893e-b8b4-4d66-823e-847ef9b010e6	7d3915cf-5ece-4c2c-9e67-8f4589cf6948	solgambles dev back with a new banger	Lets see how long before he abandons and rugs this one	general	1	0	0	f	f	2025-10-29 15:11:06.982196	2025-10-29 15:11:06.982196
fa735a5e-a539-48cf-bc41-f0a3f64b4fbe	e5275105-2102-4d2c-afda-0440b7afaab3	X ;)	https://x.com/WhaleWatchersHQ	general	1	0	0	f	f	2025-10-29 18:38:20.498232	2025-10-29 18:38:20.498232
\.


--
-- Data for Name: kol_metrics_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kol_metrics_history (id, kol_id, followers, engagement_rate, trending, trending_percent, created_at) FROM stdin;
c4797bb5-c39a-4858-bf5d-8c5b33ec0829	df99abe0-2800-4600-901b-e78c125107e1	125080	4.72	t	0.10	2025-10-27 00:02:21.621948
c74889bd-f3a4-4cde-8d09-e9dc08b56780	d64b5f01-b88a-4718-be6f-5d478bc95f1e	89307	3.12	f	\N	2025-10-27 00:06:26.865463
3286fc46-461f-4634-913d-b9ed5e812114	dcca0736-8e02-444c-83a5-348271d7bb1b	211345	5.53	t	0.60	2025-10-27 00:06:39.431208
1f26b2aa-203c-4736-8681-2e146c8bbbcf	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	341496	6.13	t	0.40	2025-10-27 00:06:48.816859
e66f4421-5cd1-421c-90e3-62f59503bbfd	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	57370	2.94	t	2.40	2025-10-27 00:06:49.069136
034f06a6-ed2a-4c35-843e-cdcf8b004ebd	0edd9091-a9fc-4bb4-8336-34182dc1c784	178809	4.04	t	0.50	2025-10-27 00:06:49.137725
50e908d8-6cf4-4ff3-b6b9-546775dafa79	df99abe0-2800-4600-901b-e78c125107e1	125528	4.70	t	0.40	2025-10-27 00:06:49.192301
0732dc91-e4cf-415d-8da6-855379faebeb	d64b5f01-b88a-4718-be6f-5d478bc95f1e	90117	3.08	t	0.90	2025-10-27 00:06:49.254816
288d0426-d102-4b2b-be48-3063f0860082	dcca0736-8e02-444c-83a5-348271d7bb1b	211214	5.38	t	0.10	2025-10-27 00:06:49.311198
56debb11-573b-4abc-9b79-3ddb010c6d33	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	342748	6.23	t	0.40	2025-10-27 00:36:48.906116
91ee9c00-6218-47bd-abd6-4fec6856ec52	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	57559	2.93	f	\N	2025-10-27 00:36:48.957871
e29ad662-6ae0-4243-9666-a5f13e0fb354	0edd9091-a9fc-4bb4-8336-34182dc1c784	180176	4.05	t	0.80	2025-10-27 00:36:49.001001
3f5398d2-3a00-4ffb-b5a4-d39e32600d64	df99abe0-2800-4600-901b-e78c125107e1	125300	4.66	t	0.20	2025-10-27 00:36:49.045073
f194ebe5-22d4-49e3-8cad-7894eb7119bb	d64b5f01-b88a-4718-be6f-5d478bc95f1e	91081	3.03	t	1.10	2025-10-27 00:36:49.087269
2cae4ce2-0861-4760-8365-de4fc67bfda6	dcca0736-8e02-444c-83a5-348271d7bb1b	212490	5.43	t	0.60	2025-10-27 00:36:49.126954
80224a18-162d-4e8b-ba89-5d709e44e068	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	344076	6.31	t	0.40	2025-10-27 01:06:49.02038
5d0e0ee9-eb7e-45b6-967d-e82bee49ef4e	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	58788	2.94	t	2.10	2025-10-27 01:06:49.073702
9f550f40-e28d-4405-aef8-77f67fb18b13	0edd9091-a9fc-4bb4-8336-34182dc1c784	180935	4.17	t	0.40	2025-10-27 01:06:49.113469
5b21264a-105d-4656-8184-63b979698215	df99abe0-2800-4600-901b-e78c125107e1	125800	4.68	t	0.40	2025-10-27 01:06:49.152043
ace9c4a8-01fb-4daf-bc5f-0aa03f969d98	d64b5f01-b88a-4718-be6f-5d478bc95f1e	90803	3.13	f	\N	2025-10-27 01:06:49.21376
128d4178-c59d-4385-be86-9fb96f5aa050	dcca0736-8e02-444c-83a5-348271d7bb1b	213321	5.54	t	0.40	2025-10-27 01:06:49.25204
15650dd0-6c5b-41df-add3-659dcd756134	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	344240	6.13	t	0.00	2025-10-27 01:28:23.43577
0e5d9134-c571-4c85-b51e-d9d454f5c941	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	59925	2.77	t	1.90	2025-10-27 01:28:23.485464
d37817f2-8676-4ed1-b96e-701290bb7c39	0edd9091-a9fc-4bb4-8336-34182dc1c784	181242	4.16	t	0.20	2025-10-27 01:28:23.546962
85991102-7d52-4666-97f5-310c428d71b1	df99abe0-2800-4600-901b-e78c125107e1	126190	4.82	t	0.30	2025-10-27 01:28:23.861778
a427a778-e56c-47ca-8340-9b38a3eb5180	d64b5f01-b88a-4718-be6f-5d478bc95f1e	91387	3.12	t	0.60	2025-10-27 01:28:23.921891
0a01edc8-1f4f-4210-b0f0-5c7d9626c219	dcca0736-8e02-444c-83a5-348271d7bb1b	213236	5.46	t	0.00	2025-10-27 01:28:23.976201
5423050a-a741-4b59-98f3-d07fa52fcde5	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	345139	6.23	t	0.30	2025-10-27 01:35:19.645311
c18e329e-a286-4ca0-b9ad-372b6a07c611	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	61194	2.59	t	2.10	2025-10-27 01:35:19.699853
3ec3b2b7-5c91-4a0d-9024-be2b4ccb4fc8	0edd9091-a9fc-4bb4-8336-34182dc1c784	182440	4.22	t	0.70	2025-10-27 01:35:19.92847
6b7fafd5-dcae-4a56-919e-456c3a1c8a03	df99abe0-2800-4600-901b-e78c125107e1	127643	4.76	t	1.20	2025-10-27 01:35:19.973826
d2f0c8ee-fd09-4a89-ab99-35fa87abdfc0	d64b5f01-b88a-4718-be6f-5d478bc95f1e	91436	3.31	f	\N	2025-10-27 01:35:20.018166
42b9a2dc-9d18-44d5-95c5-5eefb7bd7feb	dcca0736-8e02-444c-83a5-348271d7bb1b	214224	5.57	t	0.50	2025-10-27 01:35:20.060895
18372745-9f38-4533-9c02-1b323e884829	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	345385	6.25	t	0.10	2025-10-27 01:38:45.437423
821bb3b7-0c1c-4551-ab78-dcc64f7e575f	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	61900	2.59	t	1.20	2025-10-27 01:38:45.722738
986d284a-eb89-4f79-82e6-f34d8fb7a607	0edd9091-a9fc-4bb4-8336-34182dc1c784	183049	4.35	t	0.30	2025-10-27 01:38:45.766294
45611a5a-17e5-4556-8845-8bedd9a37680	df99abe0-2800-4600-901b-e78c125107e1	128295	4.95	t	0.50	2025-10-27 01:38:45.816365
94edc0a6-9097-4560-b3a6-fe7b90cdea44	d64b5f01-b88a-4718-be6f-5d478bc95f1e	92844	3.34	t	1.50	2025-10-27 01:38:45.868081
d900c95c-492c-4abc-9cfc-0c1b080f9d1b	dcca0736-8e02-444c-83a5-348271d7bb1b	215717	5.38	t	0.70	2025-10-27 01:38:45.913614
9c03a3a5-899c-455a-bb11-a4560d50d842	0edd9091-a9fc-4bb4-8336-34182dc1c784	182766	4.37	t	0.20	2025-10-27 01:44:40.738124
0c69d239-1f03-4f13-932d-b60ece22bd88	df99abe0-2800-4600-901b-e78c125107e1	128043	4.90	t	0.20	2025-10-27 01:44:40.79073
b9a0a0d3-c676-41b1-b8db-fffbf2dc74db	d64b5f01-b88a-4718-be6f-5d478bc95f1e	93501	3.31	t	0.70	2025-10-27 01:44:41.072558
500d2d3b-db83-4246-840e-0020495ecce7	dcca0736-8e02-444c-83a5-348271d7bb1b	216613	5.47	t	0.40	2025-10-27 01:44:41.12554
bbd52c5c-a46a-4f68-8d39-950c1021426f	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	346799	6.41	t	0.40	2025-10-27 01:44:41.171403
572d1ec5-2828-4fa1-bc82-3a486424e4c5	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	61602	2.69	f	\N	2025-10-27 01:44:41.21524
b1889e58-ca4e-4a50-94e2-e0a6d88a7d49	28045aed-c22a-400a-af25-af765f640bb8	40998	10.00	t	0.90	2025-10-27 02:03:08.834353
fb44805f-650c-4a94-8fee-9f3045da368b	f3c9a444-0ead-4253-901a-69517f1d4a28	11853	10.00	t	3.80	2025-10-27 02:03:09.097062
0a3ec583-7af3-4899-8714-c7007e413d2c	6225736b-d70a-4635-a9e2-83fd3d045ffe	32774	10.00	t	1.30	2025-10-27 02:03:09.137824
505903ba-bf14-4674-b4db-dc661e7e31b6	9a76d553-5287-4006-8315-a03392ced768	54272	10.00	t	2.70	2025-10-27 02:03:09.176803
11a38e35-1797-4a08-883a-afc9919e3e48	0edd9091-a9fc-4bb4-8336-34182dc1c784	183367	4.39	t	0.30	2025-10-27 02:03:09.219573
cb80161a-c7d6-47a7-8a21-d7cb3c2ec9d2	df99abe0-2800-4600-901b-e78c125107e1	127584	5.09	t	0.40	2025-10-27 02:03:09.257972
5ca504e6-18a2-478d-9d52-6a5903fed749	d64b5f01-b88a-4718-be6f-5d478bc95f1e	94444	3.25	t	1.00	2025-10-27 02:03:09.297617
adafeec8-8c34-4c9d-8489-9ae182c796cd	dcca0736-8e02-444c-83a5-348271d7bb1b	217279	5.51	t	0.30	2025-10-27 02:03:09.335993
e28ead78-2463-4590-b064-b1ae646ca64c	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	347080	6.59	t	0.10	2025-10-27 02:03:09.375601
bf0fdbf7-bdd6-48e1-aae5-757b5c22a104	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	61953	2.78	f	\N	2025-10-27 02:03:09.415023
05fe00e6-8670-4377-8af0-7ec53374bfbe	48fd5bc9-7b30-41e8-a7c5-98387139c979	23504	10.00	t	0.90	2025-10-27 02:03:09.453791
49a18af7-4823-45da-8a46-cf8dddade187	55bbf3e2-9acd-4d86-9368-ab41f801b19c	40001	10.00	t	0.60	2025-10-27 02:03:09.493714
c53d2d7a-39a7-43f7-8b39-829aef193b94	00a0edb8-f329-458e-9ead-36904162e7da	27299	10.00	t	1.80	2025-10-27 02:03:09.532415
99ded6f0-4fa3-40c0-9af9-5e204523238d	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	35416	10.00	t	3.20	2025-10-27 02:03:09.571492
994a0293-cc79-4fe5-ad90-5ba8ea8f7a5c	f0d37280-6d2b-4568-bf83-64be010be717	39437	10.00	t	3.80	2025-10-27 02:03:09.610273
c4dcc98c-d9c6-442b-82d1-464217bd5f77	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49218	10.00	t	1.90	2025-10-27 02:03:09.649049
0ea71fd5-9f83-4411-8ca2-aa23de51119c	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	25244	10.00	t	1.70	2025-10-27 02:03:09.691992
1779f932-5f99-4b89-a4b8-b076f8f76289	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	41912	10.00	t	2.60	2025-10-27 02:03:09.732182
7b991309-8a59-46a5-a88e-60115c7608de	c47d2e86-6f9c-4fe3-b718-715da4f65586	17795	10.00	t	2.00	2025-10-27 02:03:09.775173
7f7379a2-41de-4cb6-a842-40966e52d766	3bd6e77f-cc26-4130-a8be-2f16620f87ef	27050	10.00	t	2.90	2025-10-27 02:03:09.814154
8b9e2050-5462-4260-a653-172c2dae046a	de488477-23b8-484d-90fa-59e29f4e26c5	31137	10.00	t	2.00	2025-10-27 02:03:09.853783
81911fa7-372a-4203-8d0c-17bfb04170ea	e6667556-2e70-495e-9a0f-68ec54d7b5f4	19364	10.00	t	1.30	2025-10-27 02:03:09.892798
289c3812-00f7-48cd-8b93-9ddd88fbdf51	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	12020	10.00	t	7.70	2025-10-27 02:03:09.933937
411cd53e-5ef9-48ed-9b90-e3221d700b31	613a324c-091b-4948-a69b-5144b04bb933	37012	10.00	t	2.70	2025-10-27 02:03:09.973452
c645eba9-d835-4684-bc71-38a675c31f39	502a8fee-21f9-42eb-8784-9c4b55ea4f30	13859	10.00	t	7.30	2025-10-27 02:03:10.013874
53b7a0eb-411d-4d7b-a968-65bc243cf3ff	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	23462	10.00	t	1.80	2025-10-27 02:03:10.053617
4875fb73-0336-478d-98d2-efa7820d3f4f	b85b749d-d66f-4a88-89cc-c61cfe123d9c	44174	10.00	t	3.20	2025-10-27 02:03:10.092238
2a449996-fb6b-4fd3-b339-1bc74e66f35b	5d15d55f-1f0e-4757-b774-cb24606f1757	14378	10.00	t	9.70	2025-10-27 02:03:10.13185
296f816a-fe5b-495b-9584-061d3410a30b	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	62682	2.82	t	1.20	2025-10-27 02:25:32.753741
b2b2cd2f-4826-426b-9d9c-fe5f2b7baf58	48fd5bc9-7b30-41e8-a7c5-98387139c979	23902	10.00	t	1.70	2025-10-27 02:25:33.024455
526cc778-a2d0-4761-bc56-51b3b4d84105	e6667556-2e70-495e-9a0f-68ec54d7b5f4	39601	10.00	t	3.30	2025-10-27 02:25:33.067735
c49fb4ce-e0e4-49dd-8b31-4324dbb10886	28045aed-c22a-400a-af25-af765f640bb8	26885	10.00	t	3.80	2025-10-27 02:25:33.111587
dc22cd5d-bdf5-4692-b005-1a2d4494fad5	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	16874	10.00	t	8.40	2025-10-27 02:25:33.154556
2113ea44-821b-4de1-b5c8-439f15f2a5ce	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	34957	10.00	t	4.40	2025-10-27 02:25:33.1975
3d10027f-2b89-4833-9eae-2d5fa2b1ac3b	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	25173	10.00	t	6.20	2025-10-27 02:25:33.239361
a0434cdf-a1c2-4875-8cfc-dc2e708b8504	b85b749d-d66f-4a88-89cc-c61cfe123d9c	47197	10.00	t	0.60	2025-10-27 02:25:33.282337
e9d6697c-ce29-4038-8135-721a0197bf0f	5d15d55f-1f0e-4757-b774-cb24606f1757	12142	10.00	t	8.60	2025-10-27 02:25:33.325425
64d4a17c-202d-4ac8-b64b-3f8b9b849eed	c47d2e86-6f9c-4fe3-b718-715da4f65586	17715	9.88	t	0.40	2025-10-27 02:25:33.369016
c44c396c-3e2c-48cd-ae9f-60a397027184	f3c9a444-0ead-4253-901a-69517f1d4a28	19076	10.00	t	0.10	2025-10-27 02:25:33.41025
018ab4e6-a5f3-42f3-8ba3-bad8552bf70f	6225736b-d70a-4635-a9e2-83fd3d045ffe	60631	10.00	t	2.00	2025-10-27 02:25:33.459038
459be834-2e11-4421-a494-fd7b14c78c29	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	46144	10.00	t	2.70	2025-10-27 02:25:33.50057
a6e2d9bf-8ddb-4704-8398-49c7a106fc1f	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	47540	10.00	t	2.50	2025-10-27 02:25:33.543154
e098b850-ee9c-46dd-8908-e9cec46a6620	613a324c-091b-4948-a69b-5144b04bb933	39026	10.00	t	2.40	2025-10-27 02:25:33.583806
3d79f4ae-83a0-4646-8169-34650d5e40f0	0edd9091-a9fc-4bb4-8336-34182dc1c784	183393	4.47	t	0.00	2025-10-27 02:25:33.624436
b3fcdc45-77b6-43bc-b2bc-577a03964a9b	df99abe0-2800-4600-901b-e78c125107e1	128475	5.01	t	0.70	2025-10-27 02:25:33.664742
b0eb006b-b9a0-40b7-8328-78ab01b22167	d64b5f01-b88a-4718-be6f-5d478bc95f1e	94371	3.40	f	\N	2025-10-27 02:25:33.705346
ec892537-6814-4aa8-ae2a-bd11a97b2d9f	dcca0736-8e02-444c-83a5-348271d7bb1b	218096	5.46	t	0.40	2025-10-27 02:25:33.746551
9e310505-b736-4913-bee8-18c1262256f2	3bd6e77f-cc26-4130-a8be-2f16620f87ef	58306	10.00	t	2.10	2025-10-27 02:25:33.786588
747ce802-a87c-4f19-87e6-8852064e18cd	502a8fee-21f9-42eb-8784-9c4b55ea4f30	15244	10.00	t	7.10	2025-10-27 02:25:33.828148
fcd308a2-b3aa-4b41-be75-9cbc86f38d93	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	34795	10.00	t	0.50	2025-10-27 02:25:33.869738
6ac47b5e-f7b8-4394-9a35-5303230cea09	f0d37280-6d2b-4568-bf83-64be010be717	19906	10.00	t	2.40	2025-10-27 02:25:33.918441
d25c49b1-6079-4840-b54c-457754acdd1f	9a76d553-5287-4006-8315-a03392ced768	22668	10.00	t	3.60	2025-10-27 02:25:33.964135
e5b88efa-b715-4523-b9b9-019c4832fe86	55bbf3e2-9acd-4d86-9368-ab41f801b19c	46463	10.00	t	3.20	2025-10-27 02:25:34.012184
bb4da48c-cff9-4397-bcaf-abc03d08a66e	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	348104	6.73	t	0.30	2025-10-27 02:25:34.203009
8870a50e-c250-4fa4-814b-d0a60e3ac926	de488477-23b8-484d-90fa-59e29f4e26c5	54403	10.00	t	0.20	2025-10-27 02:25:34.251968
33c38830-3459-4d63-8d20-900829c1ac77	00a0edb8-f329-458e-9ead-36904162e7da	16955	10.00	t	1.70	2025-10-27 02:25:34.295746
98507a74-acca-4f48-8705-1c88747462ec	b85b749d-d66f-4a88-89cc-c61cfe123d9c	46912	9.94	t	0.60	2025-10-27 13:01:25.39879
805a3d7f-bf4e-48cd-bf65-8880b5c965cc	5d15d55f-1f0e-4757-b774-cb24606f1757	13191	9.99	t	8.60	2025-10-27 13:01:25.485676
488883b9-f860-4ca6-b4d0-9104b5114ca7	c47d2e86-6f9c-4fe3-b718-715da4f65586	17438	9.98	t	1.60	2025-10-27 13:01:25.549561
3419f708-3a9a-4d25-8098-c29e7f73b643	f3c9a444-0ead-4253-901a-69517f1d4a28	19355	9.93	t	1.50	2025-10-27 13:01:25.609194
88c97c9b-7a19-4c9f-b778-2492db94fd76	6225736b-d70a-4635-a9e2-83fd3d045ffe	61423	10.00	t	1.30	2025-10-27 13:01:25.655838
1bdb3b95-80b8-43a1-aebf-eab5bd926871	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	46417	9.89	t	0.60	2025-10-27 13:01:25.700396
6deb0a49-b39e-44fe-a281-f5f617c8a615	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	47638	9.93	t	0.20	2025-10-27 13:01:25.745637
598ed363-01ba-4465-8168-653d3f67fb4d	0edd9091-a9fc-4bb4-8336-34182dc1c784	184704	4.28	t	0.70	2025-10-27 13:01:25.788686
a20c8a11-3adf-408e-98e2-33a91cc89b84	df99abe0-2800-4600-901b-e78c125107e1	128560	4.98	t	0.10	2025-10-27 13:01:25.839151
23a84ba6-a7d0-41cc-8432-15219574d408	d64b5f01-b88a-4718-be6f-5d478bc95f1e	94963	3.26	t	0.60	2025-10-27 13:01:25.885813
dfb31e53-c867-42c0-bb41-d914946529f1	dcca0736-8e02-444c-83a5-348271d7bb1b	219506	5.43	t	0.60	2025-10-27 13:01:26.180061
a9f41e41-3691-4a76-bd27-f2864e346b91	3bd6e77f-cc26-4130-a8be-2f16620f87ef	58150	9.93	t	0.30	2025-10-27 13:01:26.225358
fbfea430-c76f-4224-8b61-2bf2f6ff935e	502a8fee-21f9-42eb-8784-9c4b55ea4f30	14791	10.00	t	3.00	2025-10-27 13:01:26.268091
564477b7-4062-46bc-8f71-9653aa83e02c	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35834	9.94	t	3.00	2025-10-27 13:01:26.313191
291b26c0-4dc7-45e1-aeb9-6de80eaa239d	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	62682	2.67	f	\N	2025-10-27 13:01:26.35669
81d1f0de-863d-4290-b5e9-68e11592bad5	48fd5bc9-7b30-41e8-a7c5-98387139c979	24052	9.95	t	0.60	2025-10-27 13:01:26.400036
4de5f3c3-093b-426c-b14a-29c90e8030e6	e6667556-2e70-495e-9a0f-68ec54d7b5f4	41044	10.00	t	3.60	2025-10-27 13:01:26.442792
265e139b-8dbf-440e-946f-7d6f9e91c7f3	28045aed-c22a-400a-af25-af765f640bb8	26592	10.00	t	1.10	2025-10-27 13:01:26.485418
2721923e-ad93-4a03-be09-1d9d3cf13636	613a324c-091b-4948-a69b-5144b04bb933	39716	9.86	t	1.80	2025-10-27 13:01:26.531004
1ebf447a-fa1c-48d3-80a6-e0cdce668e89	f0d37280-6d2b-4568-bf83-64be010be717	20928	10.00	t	5.10	2025-10-27 13:01:26.573405
880c8dd2-1ed4-4b3e-8fb9-bcdf829f21f7	55bbf3e2-9acd-4d86-9368-ab41f801b19c	47426	10.00	t	2.10	2025-10-27 13:01:26.617253
50feef10-101d-4b01-bf60-5d3806278d1d	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	348202	6.67	t	0.00	2025-10-27 13:01:26.659632
33817afd-e57f-4e00-a8b1-ef543b7fe41c	de488477-23b8-484d-90fa-59e29f4e26c5	54749	10.00	t	0.60	2025-10-27 13:01:26.703229
c79f00e9-550d-4fe3-821b-bf7a6f94a69f	00a0edb8-f329-458e-9ead-36904162e7da	18381	9.88	t	8.40	2025-10-27 13:01:26.752332
95cbd2ee-5a57-49fd-8f3d-62ad4e0a322b	9a76d553-5287-4006-8315-a03392ced768	23122	9.85	t	2.00	2025-10-27 13:01:26.805401
44de4243-c128-4a6f-8af2-8ab0bd61d8fc	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	18052	9.87	t	7.00	2025-10-27 13:01:26.851369
638028ae-caa0-4705-a9a9-6739ba33c3ca	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	34589	9.93	t	1.10	2025-10-27 13:01:26.893803
187b865e-84ca-4345-acf7-4e840c6fe7cf	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	25258	10.00	t	0.30	2025-10-27 13:01:26.942221
9732a9ea-7717-46a7-86f2-1b3e7a6ebe70	6225736b-d70a-4635-a9e2-83fd3d045ffe	61403	9.94	t	0.00	2025-10-27 13:15:27.180802
ba29a3e5-ca6c-450e-a5e2-731f7f0cbe5f	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	47077	10.00	t	1.40	2025-10-27 13:15:27.445176
b22dae29-28a9-4983-b9f6-8c2d5f2bde96	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	48773	9.80	t	2.40	2025-10-27 13:15:27.48706
e074fb4f-a406-42d2-88de-e64ccbdd4ce5	0edd9091-a9fc-4bb4-8336-34182dc1c784	185749	4.47	t	0.60	2025-10-27 13:15:27.530852
489e09be-391a-445d-bc6c-d794b459f059	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35343	9.91	t	1.40	2025-10-27 13:15:27.574766
1326030a-68a4-48ee-9c73-3f92a98ac249	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	62727	2.53	f	\N	2025-10-27 13:15:27.615184
8b55f04f-ea4e-4190-97bd-ebb9408faf95	48fd5bc9-7b30-41e8-a7c5-98387139c979	24050	9.88	t	0.00	2025-10-27 13:15:27.655376
12684376-42c4-478d-9760-cfdf5e556346	e6667556-2e70-495e-9a0f-68ec54d7b5f4	40918	10.00	t	0.30	2025-10-27 13:15:27.695268
f41a9249-d8c8-46ea-b550-0d207728c366	28045aed-c22a-400a-af25-af765f640bb8	27087	10.00	t	1.90	2025-10-27 13:15:27.735642
e81e6abc-5726-423d-bab4-a3aa4e4dd17b	613a324c-091b-4948-a69b-5144b04bb933	41169	9.82	t	3.70	2025-10-27 13:15:27.775939
fd7ed864-8106-4f66-ad4e-ad31f4642aaa	f0d37280-6d2b-4568-bf83-64be010be717	21461	10.00	t	2.50	2025-10-27 13:15:27.813476
ccc5bfa6-b30a-4a3d-872e-d4b98195cc4c	55bbf3e2-9acd-4d86-9368-ab41f801b19c	48708	10.00	t	2.70	2025-10-27 13:15:27.854408
6717b986-e9f9-41f4-8f6b-221e5bd4fbb8	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	349437	6.49	t	0.40	2025-10-27 13:15:27.893448
0a9f1e01-ab15-40d9-8a16-ed047d00e7a2	de488477-23b8-484d-90fa-59e29f4e26c5	55428	9.87	t	1.20	2025-10-27 13:15:27.93346
e0fb9b72-b136-4ec7-95dc-e3d764e5cbd7	00a0edb8-f329-458e-9ead-36904162e7da	19548	10.00	t	6.30	2025-10-27 13:15:27.973024
0db6ff5a-9859-47ff-90c5-24703797510d	9a76d553-5287-4006-8315-a03392ced768	24577	9.69	t	6.30	2025-10-27 13:15:28.013075
ed9a5684-0dd8-4a47-b6aa-94da9b139fc1	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	19472	9.97	t	7.90	2025-10-27 13:15:28.052104
2067a52e-7464-439d-8f18-29e5ec92b57f	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	35105	9.76	t	1.50	2025-10-27 13:15:28.091785
aed5e796-6dc1-47b3-bcb0-1d0c43ffe693	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	24966	9.95	t	1.20	2025-10-27 13:15:28.133277
cc3df525-af24-450c-aeea-072931669567	b85b749d-d66f-4a88-89cc-c61cfe123d9c	46601	9.83	t	0.70	2025-10-27 13:15:28.17103
2c1dbb42-fa09-46f1-8309-5e6cd4488330	5d15d55f-1f0e-4757-b774-cb24606f1757	14519	10.00	t	10.10	2025-10-27 13:15:28.211728
eb01f80d-f1cc-4661-9f1b-23096b8e1afc	c47d2e86-6f9c-4fe3-b718-715da4f65586	17768	10.00	t	1.90	2025-10-27 13:15:28.249538
bcf972b3-fac2-4bed-8c66-5731b46224b7	f3c9a444-0ead-4253-901a-69517f1d4a28	20383	9.88	t	5.30	2025-10-27 13:15:28.289759
732ce8d5-1e89-47e4-a6d6-d2769dd350ea	df99abe0-2800-4600-901b-e78c125107e1	129595	5.05	t	0.80	2025-10-27 13:15:28.331024
a6cc918a-721c-45ab-8511-a2fd64eaeb15	d64b5f01-b88a-4718-be6f-5d478bc95f1e	94698	3.25	f	\N	2025-10-27 13:15:28.369029
d42c1325-dc72-4adb-8f05-0a71ffc0b9fe	dcca0736-8e02-444c-83a5-348271d7bb1b	219205	5.34	t	0.10	2025-10-27 13:15:28.407693
30b78329-edfd-494c-9db0-947c156564df	3bd6e77f-cc26-4130-a8be-2f16620f87ef	58523	10.00	t	0.60	2025-10-27 13:15:28.446307
53c1ada8-a67d-4df6-941e-8e24805cd629	502a8fee-21f9-42eb-8784-9c4b55ea4f30	15536	10.00	t	5.00	2025-10-27 13:15:28.486285
a5391a24-ae6e-4495-938e-0c7a0fb7c7b8	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49227	9.96	t	0.90	2025-10-27 13:45:27.285447
0728b9d8-e2aa-4d47-ab4e-e4548e508556	0edd9091-a9fc-4bb4-8336-34182dc1c784	186093	4.35	t	0.20	2025-10-27 13:45:27.332895
c88c9ec5-61e0-42a6-be21-c3f19f3175a5	55bbf3e2-9acd-4d86-9368-ab41f801b19c	48918	10.00	t	0.40	2025-10-27 13:45:27.382663
4ad22085-c977-433b-852b-71b432848b82	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	350700	6.38	t	0.40	2025-10-27 13:45:27.427118
ee7cfe8c-f474-47e8-b1a3-798a0129e55c	de488477-23b8-484d-90fa-59e29f4e26c5	56174	9.87	t	1.30	2025-10-27 13:45:27.473518
27a3f3dc-5a4b-4095-91a3-e783cbf2c8ec	00a0edb8-f329-458e-9ead-36904162e7da	19891	9.93	t	1.80	2025-10-27 13:45:27.521105
7887909c-5cc3-454b-b737-5e29aff4c39a	9a76d553-5287-4006-8315-a03392ced768	25751	9.81	t	4.80	2025-10-27 13:45:27.565504
71b0fb8b-243e-459c-8b9d-23ceee753748	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	19490	9.93	t	0.10	2025-10-27 13:45:27.611241
ea392da0-9045-4b50-951d-502f1da3cf56	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	35445	9.68	t	1.00	2025-10-27 13:45:27.656439
f388db2b-61fb-4c10-8446-990f9fa906f1	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	24704	10.00	t	1.00	2025-10-27 13:45:27.700727
a48bbb5c-2f3a-4fc5-9626-c59936091b73	b85b749d-d66f-4a88-89cc-c61cfe123d9c	46184	9.79	t	0.90	2025-10-27 13:45:27.746065
5bf04e6c-3fb1-414c-8244-e71bf4ea5a02	5d15d55f-1f0e-4757-b774-cb24606f1757	15168	10.00	t	4.50	2025-10-27 13:45:27.789493
13d199ab-d868-4395-a349-4b6b1d8fd167	c47d2e86-6f9c-4fe3-b718-715da4f65586	18733	9.96	t	5.40	2025-10-27 13:45:27.834453
8e363fc2-9ce3-48bf-a049-49449b8cc0cd	f3c9a444-0ead-4253-901a-69517f1d4a28	20485	9.84	t	0.50	2025-10-27 13:45:27.87761
d53ac797-4f45-4940-ae83-68101255b3a4	df99abe0-2800-4600-901b-e78c125107e1	130068	5.13	t	0.40	2025-10-27 13:45:27.922979
7ceb77de-541d-43ed-98f3-b6c417bc92ba	d64b5f01-b88a-4718-be6f-5d478bc95f1e	94216	3.42	f	\N	2025-10-27 13:45:27.97031
a02fbbb6-d6d7-4965-a8cb-693ba5e74b01	dcca0736-8e02-444c-83a5-348271d7bb1b	218721	5.32	t	0.20	2025-10-27 13:45:28.013802
ec02ed86-09c1-43a6-9875-0718372d62a4	3bd6e77f-cc26-4130-a8be-2f16620f87ef	58802	9.89	t	0.50	2025-10-27 13:45:28.060933
c368a265-de68-4f9b-9ac9-6de5de1d2640	502a8fee-21f9-42eb-8784-9c4b55ea4f30	16097	10.00	t	3.60	2025-10-27 13:45:28.10464
46eac095-9f9f-4d4b-9f08-3a82ad6c6110	6225736b-d70a-4635-a9e2-83fd3d045ffe	61642	9.77	t	0.40	2025-10-27 13:45:28.151054
6ba6d948-3d41-4173-972b-18f426d327db	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	46726	9.86	t	0.70	2025-10-27 13:45:28.197334
ae1dc85a-21d2-453a-b7b2-5e7af1df89ee	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35538	9.88	t	0.60	2025-10-27 13:45:28.243955
02767855-9e17-4e22-b6c5-e5b60db57e42	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	62562	2.70	f	\N	2025-10-27 13:45:28.290327
038a4812-af61-4d4f-b9b1-3db0f9f9a6ee	48fd5bc9-7b30-41e8-a7c5-98387139c979	24066	9.81	t	0.10	2025-10-27 13:45:28.338004
886e108d-a08a-4bdb-a393-5c310ceb3ed5	e6667556-2e70-495e-9a0f-68ec54d7b5f4	42387	9.92	t	3.60	2025-10-27 13:45:28.382298
f1e81a50-5c29-4c9a-a198-3281e1c71778	28045aed-c22a-400a-af25-af765f640bb8	27242	10.00	t	0.60	2025-10-27 13:45:28.425742
d0a7fc47-6b88-4ba6-ad6d-ccd91fb600d7	613a324c-091b-4948-a69b-5144b04bb933	42371	9.82	t	2.90	2025-10-27 13:45:28.475033
2a5f2aa8-acf3-4e21-a2f2-2dd0118dd085	f0d37280-6d2b-4568-bf83-64be010be717	21524	10.00	t	0.30	2025-10-27 13:45:28.522694
79acc3e0-5029-46c6-a31b-0f55ec3c7c0f	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	24685	9.81	t	0.10	2025-10-27 14:18:52.22385
caa984fb-4447-4cf6-b570-9d92deb3fbe2	b85b749d-d66f-4a88-89cc-c61cfe123d9c	47065	9.86	t	1.90	2025-10-27 14:18:52.289275
85476eae-7e3b-4e02-bf59-6b6f00212e01	5d15d55f-1f0e-4757-b774-cb24606f1757	15079	10.00	t	0.60	2025-10-27 14:18:52.33427
39776282-eddb-4d3e-b6a8-fc885a75a119	c47d2e86-6f9c-4fe3-b718-715da4f65586	19556	10.00	t	4.40	2025-10-27 14:18:52.378195
e85f8e66-1b56-48b0-83cc-1dbceed9fc51	f3c9a444-0ead-4253-901a-69517f1d4a28	20639	9.80	t	0.80	2025-10-27 14:18:52.419539
257bd135-4c52-41fc-8586-bf9eb2dedcf8	df99abe0-2800-4600-901b-e78c125107e1	130729	5.01	t	0.50	2025-10-27 14:18:52.46749
97b0540b-08c7-4977-b5a1-0f56630008be	d64b5f01-b88a-4718-be6f-5d478bc95f1e	95359	3.34	t	1.20	2025-10-27 14:18:52.508227
741e344c-9f71-4cfe-8afe-3312764ed715	dcca0736-8e02-444c-83a5-348271d7bb1b	218738	5.35	t	0.00	2025-10-27 14:18:52.548961
9766546b-c73f-4abb-810c-7a88c28fe048	3bd6e77f-cc26-4130-a8be-2f16620f87ef	58581	9.71	t	0.40	2025-10-27 14:18:52.589289
1fe87f4d-bd2a-4678-843f-c2a1f44a754f	502a8fee-21f9-42eb-8784-9c4b55ea4f30	15995	9.87	t	0.60	2025-10-27 14:18:52.63035
67d33070-04f7-4d06-8cc8-db8cde8d0848	6225736b-d70a-4635-a9e2-83fd3d045ffe	62401	9.69	t	1.20	2025-10-27 14:18:52.671553
501f9dee-a342-43f3-97d0-416f9ef81498	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	46438	9.85	t	0.60	2025-10-27 14:18:52.71086
235e0d70-8e2c-4b86-a747-bb3363a2f5cb	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35730	9.96	t	0.50	2025-10-27 14:18:52.752118
ccfe86e0-19b0-4351-b3b1-4db4b4f01b04	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	62477	2.76	f	\N	2025-10-27 14:18:52.791651
bd13c06c-b560-4b20-84be-255864d322c6	48fd5bc9-7b30-41e8-a7c5-98387139c979	23784	9.97	t	1.20	2025-10-27 14:18:52.832825
2c36befa-cf8a-4123-b553-6b70ccb27385	e6667556-2e70-495e-9a0f-68ec54d7b5f4	43576	9.76	t	2.80	2025-10-27 14:18:52.873143
22a69b09-1455-4f26-ac92-22d82cbdf335	28045aed-c22a-400a-af25-af765f640bb8	27919	10.00	t	2.50	2025-10-27 14:18:52.915316
14b10fdc-07b8-4e96-b3d0-315f82c916af	613a324c-091b-4948-a69b-5144b04bb933	42642	9.93	t	0.60	2025-10-27 14:18:52.956491
5c2a7344-9aaf-466b-b290-d6e0fb97f457	f0d37280-6d2b-4568-bf83-64be010be717	21190	9.94	t	1.60	2025-10-27 14:18:52.998881
b838bd63-1b15-4be2-9ce6-3fbaedbdf3c8	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49817	9.81	t	1.20	2025-10-27 14:18:53.039911
1dd73202-27f5-4176-bb38-8dbd0c6ed684	0edd9091-a9fc-4bb4-8336-34182dc1c784	186699	4.21	t	0.30	2025-10-27 14:18:53.080018
09103636-8b44-45f0-b56d-7e6d2bcd98c6	55bbf3e2-9acd-4d86-9368-ab41f801b19c	49302	10.00	t	0.80	2025-10-27 14:18:53.123474
deb13d28-9ef2-4c67-9f77-ef11a6c82da3	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	350310	6.19	t	0.10	2025-10-27 14:18:53.164663
7af35fa1-dbb7-4128-8530-13a5f455248c	de488477-23b8-484d-90fa-59e29f4e26c5	57414	9.81	t	2.20	2025-10-27 14:18:53.204302
d6eb7636-7b99-4257-9b8e-28e812363073	00a0edb8-f329-458e-9ead-36904162e7da	20713	10.00	t	4.10	2025-10-27 14:18:53.244882
6bf239ae-6dfc-4c72-9296-dd3e6035032b	9a76d553-5287-4006-8315-a03392ced768	27247	9.62	t	5.80	2025-10-27 14:18:53.283797
c611aa88-c808-4959-b133-80361baf316d	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	19227	10.00	t	1.30	2025-10-27 14:18:53.324008
14a6dd63-d565-481c-b859-65429f739ebe	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	36895	9.59	t	4.10	2025-10-27 14:18:53.364504
6ff1d34b-651c-4b99-829a-ee9d8d0af576	3bd6e77f-cc26-4130-a8be-2f16620f87ef	59686	9.76	t	1.90	2025-10-27 14:50:43.258886
cd6c33e5-e917-4672-8c55-92eaac66c8dc	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17131	9.98	t	7.10	2025-10-27 14:50:43.326819
2c477366-a92e-41fa-8fc2-7e12bfc417cd	6225736b-d70a-4635-a9e2-83fd3d045ffe	63613	9.57	t	1.90	2025-10-27 14:50:43.367141
9aafcddf-3c4d-404b-a05c-58ccfbfdbae8	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	47252	9.73	t	1.80	2025-10-27 14:50:43.413306
c18e309f-2bd3-4949-9f0b-a2723f095d42	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35787	10.00	t	0.20	2025-10-27 14:50:43.457586
5bed0b43-9f45-4704-aeee-55acf3dbd751	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	63900	2.80	t	2.30	2025-10-27 14:50:43.500872
e00d78dd-a9a5-4ef6-a818-e9f6e259fee0	48fd5bc9-7b30-41e8-a7c5-98387139c979	24584	10.00	t	3.40	2025-10-27 14:50:43.547832
39baaa69-df2f-4062-acf2-d6f1003410df	e6667556-2e70-495e-9a0f-68ec54d7b5f4	43339	9.72	t	0.50	2025-10-27 14:50:43.590094
35d6dc59-a354-4e23-85c0-8a27f057ef56	28045aed-c22a-400a-af25-af765f640bb8	28275	10.00	t	1.30	2025-10-27 14:50:43.633356
1290ed67-a997-4b27-b677-f7106968cdf0	613a324c-091b-4948-a69b-5144b04bb933	43692	10.00	t	2.50	2025-10-27 14:50:43.678101
aa6b8c2b-2194-4645-8cf2-0b45b0cd853e	f0d37280-6d2b-4568-bf83-64be010be717	21781	9.93	t	2.80	2025-10-27 14:50:43.721816
22aa1272-e175-4def-8d3b-85cab20912bf	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49847	9.81	t	0.10	2025-10-27 14:50:43.767274
ce445691-dcec-485e-81a1-7889b0ee1ccf	0edd9091-a9fc-4bb4-8336-34182dc1c784	186297	4.01	t	0.20	2025-10-27 14:50:43.809614
5106a085-5bd4-4576-a74c-1f60de689664	55bbf3e2-9acd-4d86-9368-ab41f801b19c	50657	9.99	t	2.70	2025-10-27 14:50:43.851856
6c6dfa3f-dd1e-4603-8119-1c61f9c37f50	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	351645	6.14	t	0.40	2025-10-27 14:50:43.896842
79af3881-27ca-4ae9-99b3-a893b1d82dd8	de488477-23b8-484d-90fa-59e29f4e26c5	58689	9.81	t	2.20	2025-10-27 14:50:43.93959
5da299af-ae13-4931-ae29-9e0a3ee31ec1	00a0edb8-f329-458e-9ead-36904162e7da	21903	10.00	t	5.70	2025-10-27 14:50:43.982332
773a87f9-c053-4173-84bc-7d9d4ffa69b4	9a76d553-5287-4006-8315-a03392ced768	28018	9.64	t	2.80	2025-10-27 14:50:44.026521
b0267051-6ba1-42ef-9e95-ed335495b519	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	19839	10.00	t	3.20	2025-10-27 14:50:44.072466
c594023b-3f3e-48a5-8c30-129486b878e7	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	25307	10.00	t	2.50	2025-10-27 14:50:44.117491
eb24c32f-098d-41e6-9230-4f7b6dd133d2	b85b749d-d66f-4a88-89cc-c61cfe123d9c	47892	10.00	t	1.80	2025-10-27 14:50:44.159378
5d61d849-a44e-4cdc-a3f2-59a0e9a48d97	5d15d55f-1f0e-4757-b774-cb24606f1757	14693	9.82	t	2.60	2025-10-27 14:50:44.205002
a8039aab-7fb9-477e-a359-6ebdc1bdd135	c47d2e86-6f9c-4fe3-b718-715da4f65586	20499	10.00	t	4.80	2025-10-27 14:50:44.247329
f9faa4b2-6b99-41a3-a01b-a83e205ec297	f3c9a444-0ead-4253-901a-69517f1d4a28	21031	9.74	t	1.90	2025-10-27 14:50:44.291296
b34049d3-7cae-4791-a818-c90f0ce6ecad	df99abe0-2800-4600-901b-e78c125107e1	131697	5.19	t	0.70	2025-10-27 14:50:44.334361
e9f29936-cd04-4a04-bcda-b07affd70726	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	36600	9.66	t	0.80	2025-10-27 14:50:44.37524
f21c1926-1aa2-465f-ae22-dd47ba3b3c1e	d64b5f01-b88a-4718-be6f-5d478bc95f1e	95642	3.49	f	\N	2025-10-27 14:50:44.419719
2d1d5b2d-7a53-411a-96fb-4dff39e01d43	dcca0736-8e02-444c-83a5-348271d7bb1b	220002	5.29	t	0.60	2025-10-27 14:50:44.459066
4e43d550-c05c-4305-a3c9-929eeaffada4	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	36017	9.97	t	0.60	2025-10-27 15:20:42.367581
2ecdc88c-a468-4c1f-a480-7cee11dd30d2	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	63841	2.62	f	\N	2025-10-27 15:20:42.475442
8dab1cac-d21a-486b-b770-753dbf341b65	48fd5bc9-7b30-41e8-a7c5-98387139c979	24790	10.00	t	0.80	2025-10-27 15:20:42.51898
0b577fae-d23e-403e-8ce3-171b58fc5b6d	e6667556-2e70-495e-9a0f-68ec54d7b5f4	43505	9.89	t	0.40	2025-10-27 15:20:42.567898
031d7171-a389-4a05-a7f3-9f805a52c51c	0edd9091-a9fc-4bb4-8336-34182dc1c784	187130	4.03	t	0.40	2025-10-27 15:20:42.641723
468548bb-2f1d-4eea-8484-525d8822e197	55bbf3e2-9acd-4d86-9368-ab41f801b19c	50213	9.98	t	0.90	2025-10-27 15:20:42.685402
87b1bcc5-e312-4e7f-9c33-3baec4eaa6e1	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	351253	6.34	t	0.10	2025-10-27 15:20:42.73075
a4549d85-c970-451d-97a0-5b1e1a0f0495	de488477-23b8-484d-90fa-59e29f4e26c5	58912	9.66	t	0.40	2025-10-27 15:20:42.774377
cddd013b-fb73-4498-bea6-1fa0abfa9530	00a0edb8-f329-458e-9ead-36904162e7da	22097	10.00	t	0.90	2025-10-27 15:20:42.822898
7cf97063-6d18-45ae-83b1-1b09653c3bc1	9a76d553-5287-4006-8315-a03392ced768	29424	9.49	t	5.00	2025-10-27 15:20:42.869948
aadf2c0c-6d1c-4be4-b01d-ad43c03d51b5	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	21064	9.81	t	6.20	2025-10-27 15:20:42.914388
e7bbd964-7f4c-42fd-810c-3085ca1b3e71	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	25757	10.00	t	1.80	2025-10-27 15:20:42.973052
2fc86b7f-5310-432c-a1d3-e821f12194f5	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48176	10.00	t	0.60	2025-10-27 15:20:43.015077
deb39fa8-e46d-40c7-b8f8-c36afc3b9206	5d15d55f-1f0e-4757-b774-cb24606f1757	14984	9.87	t	2.00	2025-10-27 15:20:43.060577
f65ef834-79f0-48e6-8e2e-94b89e776447	c47d2e86-6f9c-4fe3-b718-715da4f65586	21131	10.00	t	3.10	2025-10-27 15:20:43.104088
f1138db7-d0ae-45a4-8e51-dd21a4cb9b2f	f3c9a444-0ead-4253-901a-69517f1d4a28	22386	9.56	t	6.40	2025-10-27 15:20:43.146628
ef7500d0-8fa6-471a-b50e-f8179feb0edf	df99abe0-2800-4600-901b-e78c125107e1	131863	5.23	t	0.10	2025-10-27 15:20:43.205001
38f37dbf-9d83-4ba8-b680-b601683a6d71	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	36241	9.49	t	1.00	2025-10-27 15:20:43.263326
7f718d27-e35c-4b82-8a9d-c15e5f860b95	d64b5f01-b88a-4718-be6f-5d478bc95f1e	96043	3.55	f	\N	2025-10-27 15:20:43.318753
f6396115-720a-4692-9304-c991f4f3553d	dcca0736-8e02-444c-83a5-348271d7bb1b	221070	5.11	t	0.50	2025-10-27 15:20:43.377754
96f077c8-746b-4b10-8591-665d5d4ce4ac	3bd6e77f-cc26-4130-a8be-2f16620f87ef	60557	9.94	t	1.50	2025-10-27 15:20:43.425488
1ba0238c-969b-4352-841c-3027e92c71d0	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17555	9.95	t	2.50	2025-10-27 15:20:43.469943
3a55305e-0d82-4c7c-8299-57c136bfc920	6225736b-d70a-4635-a9e2-83fd3d045ffe	64649	9.59	t	1.60	2025-10-27 15:20:43.520438
28fe5946-39c3-4b59-a9a7-7a4c0415c80b	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	47413	9.75	t	0.30	2025-10-27 15:20:43.565615
50208595-48b5-43b7-a606-4d4153982db9	28045aed-c22a-400a-af25-af765f640bb8	28638	10.00	t	1.30	2025-10-27 15:20:43.615771
0d5cce45-1125-4af3-855c-b3be5a04d06a	613a324c-091b-4948-a69b-5144b04bb933	44542	9.80	t	1.90	2025-10-27 15:20:43.661656
7e93bd2a-790e-471e-befa-8dad96d654a2	f0d37280-6d2b-4568-bf83-64be010be717	21668	9.78	t	0.50	2025-10-27 15:20:43.715699
80afee48-0b32-44a5-8b77-acde5692b1ad	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49705	9.78	t	0.30	2025-10-27 15:20:43.763229
d0e88511-76f3-4d8d-b6fe-e197ac8da555	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	64628	2.61	t	1.20	2025-10-27 15:50:42.497397
ae68052d-de9e-4d9b-ad50-fa6662c1c8bd	5d15d55f-1f0e-4757-b774-cb24606f1757	17346	10.00	t	2.40	2025-10-27 15:50:42.545759
53d0db6c-4511-4516-b0c1-eccbb6721922	b85b749d-d66f-4a88-89cc-c61cfe123d9c	47945	9.86	t	0.50	2025-10-27 15:50:42.594518
7f20c480-c940-4409-881b-6a84fc046661	613a324c-091b-4948-a69b-5144b04bb933	33752	10.00	t	3.50	2025-10-27 15:50:42.641507
f4fe47b4-fa58-4f35-964f-861c85b236ae	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	39969	10.00	t	0.60	2025-10-27 15:50:42.719333
e975c9de-c953-4522-bcea-b9ee2d9645a6	f3c9a444-0ead-4253-901a-69517f1d4a28	22056	9.70	t	1.50	2025-10-27 15:50:42.77562
4659852f-4159-4069-93a2-65917f8861e8	df99abe0-2800-4600-901b-e78c125107e1	131702	5.34	t	0.10	2025-10-27 15:50:42.835941
a55f6edc-cd18-4886-9346-cc37d3e08f0e	8bc0832a-a821-4ef9-b714-12c4724ac0c1	37767	10.00	t	0.90	2025-10-27 15:50:42.895581
94c27689-f53f-4545-a0a1-b5be87a252cb	d64b5f01-b88a-4718-be6f-5d478bc95f1e	96334	3.60	f	\N	2025-10-27 15:50:42.947424
875fb685-5fc6-436a-8b18-9653376a957f	dcca0736-8e02-444c-83a5-348271d7bb1b	221648	5.06	t	0.30	2025-10-27 15:50:43.015344
8c3c70e0-f206-4d67-9ab1-8622c8b16816	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	15435	10.00	t	8.10	2025-10-27 15:50:43.066602
fea37229-0755-4fcb-9e8e-f7564e4fc5db	6225736b-d70a-4635-a9e2-83fd3d045ffe	65670	9.78	t	1.60	2025-10-27 15:50:43.117373
9b705d2f-fce9-4ec4-9a13-d05b969fb0e3	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	47880	9.79	t	1.00	2025-10-27 15:50:43.17572
b3c5f1a8-4bcb-433f-b097-04e26f9b4802	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	43352	10.00	t	0.50	2025-10-27 15:50:43.223162
12dca32c-b4a1-433b-bb86-78173b805b3d	f0d37280-6d2b-4568-bf83-64be010be717	22108	9.70	t	2.00	2025-10-27 15:50:43.303239
0579c161-7f1c-44af-9f2d-e43760f2e4a9	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	50088	9.80	t	0.80	2025-10-27 15:50:43.359152
d1e0d396-755e-4357-b4b2-821fcc674222	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26763	10.00	t	2.70	2025-10-27 15:50:43.419524
bf7aacb2-a80f-492e-ab18-7bb765b02065	d326149d-4af5-4621-bb59-f4df85ea7605	14784	10.00	t	1.80	2025-10-27 15:50:43.482284
cbb5dd57-31bd-4bdd-b653-6e084de7bc2c	0edd9091-a9fc-4bb4-8336-34182dc1c784	188361	3.93	t	0.70	2025-10-27 15:50:43.532793
6f0e52df-bf53-487b-acc0-7b688055241e	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	350821	6.39	t	0.10	2025-10-27 15:50:43.588278
fa7b8b05-75ff-4a51-af4d-2c679175ccec	48fd5bc9-7b30-41e8-a7c5-98387139c979	41769	10.00	t	3.10	2025-10-27 15:50:43.63212
b6aac01b-e855-4e99-86d2-ffdc2dcd249d	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	53834	10.00	t	1.30	2025-10-27 15:50:43.680797
fdbde679-61b4-45e5-9e0e-309566f8d5d9	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	55038	10.00	t	2.30	2025-10-27 15:50:43.724437
33bc554e-8562-4802-8b4b-f47adea80f21	43b22d3e-4e94-4597-9ac7-76b163c8cd24	53311	10.00	t	0.80	2025-10-27 15:50:43.767783
e884dba8-2e72-4d58-a7ba-0e34f9b8e87a	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	45403	10.00	t	1.20	2025-10-27 15:50:43.820435
b579f2ff-7c43-4fdd-815c-4dde28c2b57c	e6667556-2e70-495e-9a0f-68ec54d7b5f4	11547	10.00	t	0.70	2025-10-27 15:50:43.88535
8c758796-4758-4767-a409-06041e7e1f11	00a0edb8-f329-458e-9ead-36904162e7da	22610	10.00	t	2.30	2025-10-27 15:50:44.127311
53842e61-5992-4883-92fc-426727caf368	3bd6e77f-cc26-4130-a8be-2f16620f87ef	55789	10.00	t	2.60	2025-10-27 15:50:44.174946
9e7a820f-1c39-4802-8c2e-02bea276d587	02a20037-4254-40b0-8310-5d188c664fc9	38193	10.00	t	2.40	2025-10-27 15:50:44.240401
720c6be4-7506-4c8f-814c-ab73d5d97b97	502a8fee-21f9-42eb-8784-9c4b55ea4f30	16619	10.00	t	0.30	2025-10-27 15:50:44.283365
cbb0345b-442f-4768-9d1d-ba87d15ce50d	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	35674	9.95	t	1.00	2025-10-27 15:50:44.345517
9059b31e-1281-44f7-91d0-e591a756a653	9a76d553-5287-4006-8315-a03392ced768	16527	10.00	t	7.90	2025-10-27 15:50:44.411136
a4ab9ac4-0355-4ab9-a66d-ee8d7e2d5809	ef784796-f1d8-459b-97c0-2a1b9dea02c1	18736	10.00	t	7.00	2025-10-27 15:50:44.475452
1726e94f-2fe4-4235-8df4-4787a3aa6ce2	28045aed-c22a-400a-af25-af765f640bb8	19291	10.00	t	3.20	2025-10-27 15:50:44.528168
46f9bd5a-a0a8-427a-a82c-dc78a0be170f	de488477-23b8-484d-90fa-59e29f4e26c5	36747	10.00	t	1.90	2025-10-27 15:50:44.583264
ae036222-3a67-4273-b666-feeac2d2d6ef	c47d2e86-6f9c-4fe3-b718-715da4f65586	16967	10.00	t	1.20	2025-10-27 15:50:44.655155
75dba74a-cc05-43ec-912d-99f8c3875746	5d15d55f-1f0e-4757-b774-cb24606f1757	18814	10.00	t	8.50	2025-10-27 15:56:05.728927
7c489216-acbc-4e61-a27d-b839ff1b0b6d	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	65523	2.65	t	1.40	2025-10-27 15:56:06.088682
a6528936-0192-4641-8890-9c69679f3a52	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48885	9.79	t	2.00	2025-10-27 15:56:06.144742
42aac0ed-64d3-4909-a1b6-aa2f752c4233	613a324c-091b-4948-a69b-5144b04bb933	34370	10.00	t	1.80	2025-10-27 15:56:06.191689
d148a490-4c45-4320-9591-4899e24b153b	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	39992	9.82	t	0.10	2025-10-27 15:56:06.242522
d853f73a-d695-49b2-a72c-c36a4e85362a	f3c9a444-0ead-4253-901a-69517f1d4a28	23126	9.68	t	4.90	2025-10-27 15:56:06.293912
1940a2d7-25e2-4016-b1d2-05a80bb91413	df99abe0-2800-4600-901b-e78c125107e1	131826	5.52	t	0.10	2025-10-27 15:56:06.362212
12142d72-d8f4-4f67-86c3-8f77a4d5a1f7	8bc0832a-a821-4ef9-b714-12c4724ac0c1	38540	9.98	t	2.00	2025-10-27 15:56:06.402403
4af12625-cea0-4419-8266-b6fa04fc85ef	d64b5f01-b88a-4718-be6f-5d478bc95f1e	97610	3.44	t	1.30	2025-10-27 15:56:06.446775
b92e059b-1ef8-468d-8bc5-fe0017f88696	dcca0736-8e02-444c-83a5-348271d7bb1b	221698	5.16	t	0.00	2025-10-27 15:56:06.496379
58620bbb-b384-46ce-9ccc-a489c48c4f77	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	16338	9.95	t	5.90	2025-10-27 15:56:06.540609
b4f8d5f0-901e-4ba5-9285-496bbfbeae08	6225736b-d70a-4635-a9e2-83fd3d045ffe	65430	9.81	t	0.40	2025-10-27 15:56:06.582244
27a1632d-a86c-4f07-94e2-31ff603610dc	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	48496	9.62	t	1.30	2025-10-27 15:56:06.622537
9bff2057-99c1-405e-9bfe-e8a3d547fbdb	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	44443	9.99	t	2.50	2025-10-27 15:56:06.662851
c109248a-8ae6-404a-b598-f675dae9da01	f0d37280-6d2b-4568-bf83-64be010be717	23068	9.74	t	4.30	2025-10-27 15:56:06.705191
f4a55ada-0736-44f1-9a80-44bd7086fc99	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	49889	9.89	t	0.40	2025-10-27 15:56:06.746842
b14ba1b8-d97e-47c7-a077-113c94b6c082	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26849	10.00	t	0.30	2025-10-27 15:56:06.788172
188e2ce6-25a4-4c3e-ad94-b36382d47ae4	d326149d-4af5-4621-bb59-f4df85ea7605	15963	9.94	t	8.00	2025-10-27 15:56:06.829524
602b1ad3-5f8c-4799-b026-18ecb5c5cfc2	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	351698	6.52	t	0.20	2025-10-27 15:56:06.873251
b3c0a356-6d2f-4a84-a356-0562a4eddbe2	48fd5bc9-7b30-41e8-a7c5-98387139c979	41361	10.00	t	1.00	2025-10-27 15:56:06.914063
660eafba-69fa-4aa9-802d-a51895005300	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	53367	10.00	t	0.90	2025-10-27 15:56:06.955004
ce92923b-6d37-4f44-a880-2d1f98cce7b8	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	55653	9.85	t	1.10	2025-10-27 15:56:07.003116
ef3da1de-7ee0-4850-80e1-6ab0ae61f79b	43b22d3e-4e94-4597-9ac7-76b163c8cd24	53559	10.00	t	0.50	2025-10-27 15:56:07.04507
d9df6c8b-bad7-4659-bd17-47b7a9843ed6	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	45713	10.00	t	0.70	2025-10-27 15:56:07.093072
6fe78f43-3634-4a45-8344-2a0d06144b03	e6667556-2e70-495e-9a0f-68ec54d7b5f4	11415	9.95	t	1.10	2025-10-27 15:56:07.139039
af55599f-5e97-4b4a-a1de-57dbe2d32ef8	00a0edb8-f329-458e-9ead-36904162e7da	23798	10.00	t	5.30	2025-10-27 15:56:07.190441
09e94413-7219-4e9c-8c72-3108bc5c08da	3bd6e77f-cc26-4130-a8be-2f16620f87ef	55307	9.98	t	0.90	2025-10-27 15:56:07.237114
c700030f-73c2-4e98-a49d-a63efd1526a8	02a20037-4254-40b0-8310-5d188c664fc9	38634	10.00	t	1.20	2025-10-27 15:56:07.29201
4ebd6eb3-b06c-492d-a8dd-580b8bafa442	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17208	9.91	t	3.50	2025-10-27 15:56:07.335478
dcf12b6e-a86a-42dd-92ab-2dab78e86d68	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	36278	9.94	t	1.70	2025-10-27 15:56:07.38261
6149a1ce-1820-4ddb-9521-e5f149b754fd	9a76d553-5287-4006-8315-a03392ced768	17281	9.82	t	4.60	2025-10-27 15:56:07.422935
1b2cbb31-0633-452a-9557-de728103c159	ef784796-f1d8-459b-97c0-2a1b9dea02c1	19061	9.88	t	1.70	2025-10-27 15:56:07.464506
2de2865c-3cff-4927-9630-8db5d5696be1	28045aed-c22a-400a-af25-af765f640bb8	19540	9.98	t	1.30	2025-10-27 15:56:07.532564
a315f4ec-5d20-4ddd-ae9c-398decb0949e	de488477-23b8-484d-90fa-59e29f4e26c5	37419	10.00	t	1.80	2025-10-27 15:56:07.575593
d1327c7b-fabc-472e-b76b-fddd0b3dcdfc	c47d2e86-6f9c-4fe3-b718-715da4f65586	17806	9.86	t	4.90	2025-10-27 15:56:07.616665
b8f5ff58-1b25-4976-b55a-2195e39cbd47	0edd9091-a9fc-4bb4-8336-34182dc1c784	188347	3.74	f	\N	2025-10-27 15:56:07.658103
6f1056c0-6099-4a28-9386-9a669b19d669	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	66474	2.51	t	1.50	2025-10-27 16:26:06.068638
96fdcffc-ffb0-4ac2-864f-a0c548b74d11	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48910	9.97	t	0.10	2025-10-27 16:26:06.149556
8d7b04c6-47d8-41b9-a082-e98d74923082	613a324c-091b-4948-a69b-5144b04bb933	35052	10.00	t	2.00	2025-10-27 16:26:06.202858
a1af10b4-de6f-4860-a623-bcade2d17043	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	40649	9.94	t	1.60	2025-10-27 16:26:06.261614
d9ef9878-abb7-4896-903a-18cfd3a3b2e8	f3c9a444-0ead-4253-901a-69517f1d4a28	24198	9.52	t	4.60	2025-10-27 16:26:06.324879
c1eb9f4f-1c6d-45cc-b803-0d2aba308882	df99abe0-2800-4600-901b-e78c125107e1	132731	5.36	t	0.70	2025-10-27 16:26:06.395806
877f6e4c-8087-4102-8a7b-cc696f5e8206	8bc0832a-a821-4ef9-b714-12c4724ac0c1	38841	10.00	t	0.80	2025-10-27 16:26:06.499196
09532fba-2ffc-4c75-bcd4-016020021226	d64b5f01-b88a-4718-be6f-5d478bc95f1e	97129	3.34	f	\N	2025-10-27 16:26:06.566957
a75c230e-a6b7-4f7d-96f8-f3f0c32ddd90	dcca0736-8e02-444c-83a5-348271d7bb1b	222784	5.07	t	0.50	2025-10-27 16:26:06.798012
f40dc0d3-85bf-4d73-aadd-5289e6255135	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	17261	10.00	t	5.60	2025-10-27 16:26:06.852266
c708e2d0-3f3a-4e71-941f-e9a14df1591f	6225736b-d70a-4635-a9e2-83fd3d045ffe	65599	9.89	t	0.30	2025-10-27 16:26:06.911636
e1d09011-59cf-4bbc-b7de-aebfc09cb146	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	49530	9.72	t	2.10	2025-10-27 16:26:06.994629
011ac868-0a93-436c-b2d4-20a9e0746938	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	45106	9.86	t	1.50	2025-10-27 16:26:07.082608
1f30a0e4-9a04-481e-bd4c-b4baa92cbd4e	f0d37280-6d2b-4568-bf83-64be010be717	22931	9.75	t	0.60	2025-10-27 16:26:07.13324
d3664054-58a9-41b4-a645-d48f78937592	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	50642	9.80	t	1.50	2025-10-27 16:26:07.187612
ea7c18a8-63fe-49db-88fa-def1d8dcf751	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26539	10.00	t	1.20	2025-10-27 16:26:07.250721
d1082c52-5e6e-44a6-a6ad-4a3a29d4b9e6	d326149d-4af5-4621-bb59-f4df85ea7605	16163	9.78	t	1.30	2025-10-27 16:26:07.319514
628a8d1c-d132-4093-8696-db9a6668e481	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	352392	6.43	t	0.20	2025-10-27 16:26:07.369667
22c651d8-7ee0-40ed-aa4e-e7230bd2691d	48fd5bc9-7b30-41e8-a7c5-98387139c979	42392	10.00	t	2.50	2025-10-27 16:26:07.4244
a165a203-3dc7-452c-a8c9-f0b5c47fed96	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	53423	9.96	t	0.10	2025-10-27 16:26:07.494209
9b5210a2-920a-4d8b-b893-1c6cbc233cf4	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	57016	10.00	t	2.40	2025-10-27 16:26:07.547474
faf7d573-522c-41a5-89ad-e3bc9822d927	43b22d3e-4e94-4597-9ac7-76b163c8cd24	53173	10.00	t	0.70	2025-10-27 16:26:07.615978
9c3d6fa4-4ec3-4cde-aa36-cdd9fd52323d	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	45868	10.00	t	0.30	2025-10-27 16:26:07.670932
6817f400-8fa8-43b2-9d95-4e38a56c511c	e6667556-2e70-495e-9a0f-68ec54d7b5f4	11584	10.00	t	1.50	2025-10-27 16:26:07.737971
ceaaac52-a8f1-4144-bb96-2fb7bf8d9bd8	00a0edb8-f329-458e-9ead-36904162e7da	23814	10.00	t	0.10	2025-10-27 16:26:07.801828
e39e015f-2e0a-48ec-ba31-fa5810c71e3d	3bd6e77f-cc26-4130-a8be-2f16620f87ef	56337	10.00	t	1.90	2025-10-27 16:26:07.861598
b4fc87d9-a6fd-439c-8286-cbf9d9bba7dc	02a20037-4254-40b0-8310-5d188c664fc9	39888	10.00	t	3.20	2025-10-27 16:26:07.931803
56d0d14c-98de-4381-938d-a3e93c67a44d	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17043	9.91	t	1.00	2025-10-27 16:26:08.002522
1af1391d-2733-458b-b130-caf2aeb7c8f8	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	37324	9.98	t	2.90	2025-10-27 16:26:08.05732
00545598-adc9-4a6f-b355-8818e9ca2880	9a76d553-5287-4006-8315-a03392ced768	16825	9.99	t	2.60	2025-10-27 16:26:08.118854
959908a1-4af3-4300-92ac-a8ba19692925	ef784796-f1d8-459b-97c0-2a1b9dea02c1	20553	9.75	t	7.80	2025-10-27 16:26:08.188999
476b5872-cc74-47dc-a575-e3e0f4505ed8	28045aed-c22a-400a-af25-af765f640bb8	19851	9.89	t	1.60	2025-10-27 16:26:08.25001
f8c758a9-0802-435a-8e36-90a2300e5376	de488477-23b8-484d-90fa-59e29f4e26c5	38309	9.94	t	2.40	2025-10-27 16:26:08.304989
82bf5bfe-7397-4451-9f40-bf8b342185a5	c47d2e86-6f9c-4fe3-b718-715da4f65586	17662	9.95	t	0.80	2025-10-27 16:26:08.359222
b5a005f2-d89f-48b9-b26c-293c869b2991	0edd9091-a9fc-4bb4-8336-34182dc1c784	187960	3.66	f	\N	2025-10-27 16:26:08.419147
5e63e2e8-8689-4c7d-a8d6-6d63b33d6647	5d15d55f-1f0e-4757-b774-cb24606f1757	18823	10.00	t	0.00	2025-10-27 16:26:08.492402
2c3a226b-5771-4c78-a7e3-4826eaa53e25	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48852	9.81	t	0.10	2025-10-27 16:56:06.009565
712e1a82-dc05-4842-8113-b68887442354	613a324c-091b-4948-a69b-5144b04bb933	35829	9.96	t	2.20	2025-10-27 16:56:06.062504
9b341ee2-33d9-47a3-b308-15471d4875b9	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	41480	9.98	t	2.00	2025-10-27 16:56:06.111631
056f733d-93c9-4340-b1f0-7a78b15716b7	f3c9a444-0ead-4253-901a-69517f1d4a28	23789	9.64	t	1.70	2025-10-27 16:56:06.156354
36f9ae87-e199-4f9c-9058-9b48caab2d6d	df99abe0-2800-4600-901b-e78c125107e1	133343	5.20	t	0.50	2025-10-27 16:56:06.206733
ea3a6bb9-6b88-4613-9ce9-d81c74172c07	8bc0832a-a821-4ef9-b714-12c4724ac0c1	38644	10.00	t	0.50	2025-10-27 16:56:06.255787
7cb503ff-74cd-4d47-aea4-27179bbf87ea	d64b5f01-b88a-4718-be6f-5d478bc95f1e	97111	3.34	f	\N	2025-10-27 16:56:06.30231
8150a104-4ed2-4059-823c-7db0b3d069d5	dcca0736-8e02-444c-83a5-348271d7bb1b	223906	5.17	t	0.50	2025-10-27 16:56:06.346623
1e5c0cb8-8ee4-4464-9d59-4873e3899326	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	18406	10.00	t	6.60	2025-10-27 16:56:06.391995
c110941f-44a0-46ef-9552-c71355f20dba	6225736b-d70a-4635-a9e2-83fd3d045ffe	66053	9.93	t	0.70	2025-10-27 16:56:06.447765
68711232-f0d3-49f6-a5b8-a4409b9b5952	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	50946	9.68	t	2.90	2025-10-27 16:56:06.500381
0fdd1663-3707-4926-8ac4-be836b83ee22	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	46358	9.75	t	2.80	2025-10-27 16:56:06.542166
7a2d7249-4d2c-4d74-8183-67049293bcad	f0d37280-6d2b-4568-bf83-64be010be717	22921	9.59	t	0.00	2025-10-27 16:56:06.593364
d31c6b1a-80a6-4aee-97bb-a56a275275f4	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	51829	9.61	t	2.30	2025-10-27 16:56:06.638077
149af859-fb47-42b3-b789-da732c1e75ea	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26049	9.92	t	1.80	2025-10-27 16:56:06.690919
897f18f7-827d-4ad9-9361-ab3e815b8211	d326149d-4af5-4621-bb59-f4df85ea7605	15799	9.82	t	2.30	2025-10-27 16:56:06.745187
24460c97-75cb-4104-89f6-f0157f005467	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	353803	6.53	t	0.40	2025-10-27 16:56:06.7931
be2a562b-19f4-40b3-9282-017b6739472f	48fd5bc9-7b30-41e8-a7c5-98387139c979	42562	10.00	t	0.40	2025-10-27 16:56:06.842026
c2c481d8-58ee-4b59-a4fe-90b3f692f13a	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	54483	10.00	t	2.00	2025-10-27 16:56:06.906086
460f408e-820a-479b-b863-bd009ff5c8bb	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	57999	9.82	t	1.70	2025-10-27 16:56:06.961094
c9dd6a01-c055-4e1d-90e3-953e1f9de126	43b22d3e-4e94-4597-9ac7-76b163c8cd24	52951	9.95	t	0.40	2025-10-27 16:56:07.004857
6fc88ac8-1822-41c2-a56a-765da929694a	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	46351	9.80	t	1.10	2025-10-27 16:56:07.050496
c2e49075-ef4e-41f8-b66f-4934ca300ffa	e6667556-2e70-495e-9a0f-68ec54d7b5f4	11917	10.00	t	2.90	2025-10-27 16:56:07.0933
81e14918-db95-4412-afac-82bd20bab317	00a0edb8-f329-458e-9ead-36904162e7da	24299	9.88	t	2.00	2025-10-27 16:56:07.138718
49c7eb5e-b678-4a03-bb8f-d1099d4165bd	3bd6e77f-cc26-4130-a8be-2f16620f87ef	55910	10.00	t	0.80	2025-10-27 16:56:07.18567
a3f89130-83dc-4f4c-8dd0-3c9051496db5	02a20037-4254-40b0-8310-5d188c664fc9	39751	9.86	t	0.30	2025-10-27 16:56:07.229251
4d7a7391-78aa-4eea-b575-b129ea99b609	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17374	9.75	t	1.90	2025-10-27 16:56:07.272731
06a49312-a929-4582-949a-79ad905d6def	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	37980	10.00	t	1.80	2025-10-27 16:56:07.316661
b41106fe-7415-4c21-997c-a60ea39eff00	9a76d553-5287-4006-8315-a03392ced768	16934	9.83	t	0.60	2025-10-27 16:56:07.364085
84193b7e-475f-4f41-bf5d-18411a401718	ef784796-f1d8-459b-97c0-2a1b9dea02c1	21199	9.94	t	3.10	2025-10-27 16:56:07.409911
b7fb022f-f31f-4ec9-9868-b2749b312063	28045aed-c22a-400a-af25-af765f640bb8	20594	10.00	t	3.70	2025-10-27 16:56:07.45375
b0f66a79-8cef-4b01-8c49-2b2715aa478f	de488477-23b8-484d-90fa-59e29f4e26c5	38552	9.95	t	0.60	2025-10-27 16:56:07.501371
0095c2c3-874e-458b-812a-cce26ccd4771	c47d2e86-6f9c-4fe3-b718-715da4f65586	17475	9.86	t	1.10	2025-10-27 16:56:07.549667
6449dd95-798c-46b6-ae71-584238e1d1b6	0edd9091-a9fc-4bb4-8336-34182dc1c784	188770	3.85	t	0.40	2025-10-27 16:56:07.593588
f152fc71-a4e9-43a1-8245-46843da28fc2	5d15d55f-1f0e-4757-b774-cb24606f1757	20241	10.00	t	7.50	2025-10-27 16:56:07.635744
2481d018-f74f-4e9f-a2c7-1f88cb5f02c5	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	66919	2.65	f	\N	2025-10-27 16:56:07.68176
33c53025-c03d-4773-857e-cc629447ec47	613a324c-091b-4948-a69b-5144b04bb933	35918	9.79	t	0.20	2025-10-27 17:31:45.946028
3aa6029a-10c4-44e6-b511-6a3eeda401fc	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	42345	9.91	t	2.10	2025-10-27 17:31:46.019283
b974d8f6-207b-4c4d-845b-24de1afb5fb0	f3c9a444-0ead-4253-901a-69517f1d4a28	23546	9.51	t	1.00	2025-10-27 17:31:46.063472
3169f6ee-f0b5-4cf7-a79f-67dd433b4a98	df99abe0-2800-4600-901b-e78c125107e1	133383	5.39	t	0.00	2025-10-27 17:31:46.173814
d1b46ac2-9080-4d7e-9510-cd3661e7d8bb	8bc0832a-a821-4ef9-b714-12c4724ac0c1	38503	10.00	t	0.40	2025-10-27 17:31:46.343893
434f16bd-e255-4b34-9a5f-405eebdba509	d64b5f01-b88a-4718-be6f-5d478bc95f1e	96856	3.18	f	\N	2025-10-27 17:31:46.403285
c4e53f95-7c7f-4f5d-ac50-986617fad3f1	dcca0736-8e02-444c-83a5-348271d7bb1b	224433	5.23	t	0.20	2025-10-27 17:31:46.448055
1ecdc58b-92cf-43b6-a632-f0998c41a451	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	19708	10.00	t	7.10	2025-10-27 17:31:46.566321
69c0a914-1be9-4cab-8c39-57180cab1be5	6225736b-d70a-4635-a9e2-83fd3d045ffe	67434	9.75	t	2.10	2025-10-27 17:31:46.61186
0c1017df-3339-4c73-89e9-7186e81025ca	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	51841	9.84	t	1.80	2025-10-27 17:31:46.65731
8de85cb8-8809-4fc1-a30d-50341b6bdf3c	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	46621	9.82	t	0.60	2025-10-27 17:31:46.702165
59e5324d-82d7-4891-9395-6f6fc779a5b9	f0d37280-6d2b-4568-bf83-64be010be717	22501	9.60	t	1.80	2025-10-27 17:31:46.749862
149cf789-e60b-416f-a058-cbaa18df25f8	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	51608	9.49	t	0.40	2025-10-27 17:31:46.874987
6bfeb8ac-0134-4a5a-874f-408d523e91fe	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26887	9.86	t	3.20	2025-10-27 17:31:46.91824
2c4eb7d2-7ca8-4d97-976e-2f173d3e8cee	d326149d-4af5-4621-bb59-f4df85ea7605	16878	9.98	t	6.80	2025-10-27 17:31:46.966695
78d94e4a-1a71-4593-9333-dc93cf78318c	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	354656	6.62	t	0.20	2025-10-27 17:31:47.095233
944393b4-7493-4950-a776-0b99360ad5ce	48fd5bc9-7b30-41e8-a7c5-98387139c979	44029	9.92	t	3.40	2025-10-27 17:31:47.145333
3ef2eaf2-8c4f-47e6-b350-66956cedaad1	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	54263	10.00	t	0.40	2025-10-27 17:31:47.202571
71ee2da8-14fe-4c3b-9fe7-f9862f19924b	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	57935	9.70	t	0.10	2025-10-27 17:31:47.262339
72d33800-403b-423b-b79e-47747f9cf8e9	43b22d3e-4e94-4597-9ac7-76b163c8cd24	54367	9.94	t	2.70	2025-10-27 17:31:47.391734
8d8fbcce-3f4b-474e-9c5d-b7896e59d3d8	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	46619	9.93	t	0.60	2025-10-27 17:31:47.435597
9bb5bca9-8358-4aab-aec6-16f161e26dee	e6667556-2e70-495e-9a0f-68ec54d7b5f4	11943	9.94	t	0.20	2025-10-27 17:31:47.48905
0ab34188-1bbb-499a-bfa5-506ab697037d	00a0edb8-f329-458e-9ead-36904162e7da	24743	9.77	t	1.80	2025-10-27 17:31:47.616979
b0a51f4e-a36c-48b5-a07f-14c91282e72d	3bd6e77f-cc26-4130-a8be-2f16620f87ef	55828	9.84	t	0.10	2025-10-27 17:31:47.664879
0affa2d0-a78e-4672-b90b-42810b58f2b3	02a20037-4254-40b0-8310-5d188c664fc9	40925	9.98	t	3.00	2025-10-27 17:31:47.713179
23c61198-96d2-466d-86ec-1aa2afae07cf	502a8fee-21f9-42eb-8784-9c4b55ea4f30	16900	9.84	t	2.70	2025-10-27 17:31:47.761393
5027581b-f6bf-4237-8b4d-15314239b576	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	39417	9.87	t	3.80	2025-10-27 17:31:47.81279
fce71bdd-13a8-4ddf-ad95-c243b57bc3c7	9a76d553-5287-4006-8315-a03392ced768	17016	9.83	t	0.50	2025-10-27 17:31:47.947411
12963509-f58a-4415-ba17-41e4ca040418	ef784796-f1d8-459b-97c0-2a1b9dea02c1	22198	9.80	t	4.70	2025-10-27 17:31:47.998115
fca11d7a-65de-4b9a-9ac2-cb96dc36fb33	28045aed-c22a-400a-af25-af765f640bb8	20326	9.88	t	1.30	2025-10-27 17:31:48.112195
1141b769-7061-44d9-b365-be1133232c3a	de488477-23b8-484d-90fa-59e29f4e26c5	39383	9.92	t	2.20	2025-10-27 17:31:48.156885
08b1cee3-7fa3-4d10-b93c-162bd23e662b	c47d2e86-6f9c-4fe3-b718-715da4f65586	18396	9.67	t	5.30	2025-10-27 17:31:48.204267
9314f245-9a32-41d7-b93f-c91d434dd705	0edd9091-a9fc-4bb4-8336-34182dc1c784	189666	3.81	t	0.50	2025-10-27 17:31:48.24938
31339562-e777-47f6-b368-f46c519b9be2	5d15d55f-1f0e-4757-b774-cb24606f1757	21243	9.88	t	5.00	2025-10-27 17:31:48.298277
17e24485-21bf-4be4-b0b3-9b3984893007	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	67703	2.54	t	1.20	2025-10-27 17:31:48.440395
aa5cd534-2eb8-4f7c-bf80-371a7ff8f6ad	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48549	9.88	t	0.60	2025-10-27 17:31:48.490413
e2848796-7f96-4343-94db-0c970488a485	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	42757	9.74	t	1.00	2025-10-27 18:01:44.99014
2cd6a610-1a55-4b21-9f9b-d1b571b56c83	f3c9a444-0ead-4253-901a-69517f1d4a28	23660	9.44	t	0.50	2025-10-27 18:01:45.049492
ad75af0a-5742-43ba-870e-8e7ee8047554	df99abe0-2800-4600-901b-e78c125107e1	134371	5.39	t	0.70	2025-10-27 18:01:45.095706
9fffc126-960a-429e-ad9b-3cb529dd58f6	8bc0832a-a821-4ef9-b714-12c4724ac0c1	39724	9.80	t	3.20	2025-10-27 18:01:45.14228
ccde74ab-914e-40ec-8903-d0d29818dd71	d64b5f01-b88a-4718-be6f-5d478bc95f1e	96936	3.10	f	\N	2025-10-27 18:01:45.27876
8adcf78a-99e1-4256-b015-40413e20724d	dcca0736-8e02-444c-83a5-348271d7bb1b	224718	5.18	t	0.10	2025-10-27 18:01:45.321541
2f449390-5677-4f88-b6e1-a3e48c9b8578	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	20858	9.95	t	5.80	2025-10-27 18:01:45.365382
242d2d6b-ada7-4d89-abe2-e16b0ae73667	6225736b-d70a-4635-a9e2-83fd3d045ffe	67765	9.74	t	0.50	2025-10-27 18:01:45.412227
a11e1926-fed0-4276-915b-2e6e3060829d	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	51704	9.92	t	0.30	2025-10-27 18:01:45.457787
ae480c9a-c926-4b86-9449-4e0da157d5e7	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	47820	10.00	t	2.60	2025-10-27 18:01:45.499487
53a1157b-9b68-47af-b875-47b8ae08abba	f0d37280-6d2b-4568-bf83-64be010be717	23380	9.57	t	3.90	2025-10-27 18:01:45.543347
1bdf031b-86fe-4f88-9016-36a4acef9bb4	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	52287	9.33	t	1.30	2025-10-27 18:01:45.590837
25c142c9-30af-4089-872a-2a0c4d8c7c88	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26502	9.77	t	1.40	2025-10-27 18:01:45.639202
7cab77a2-2e0a-4641-b031-83968e85fc02	d326149d-4af5-4621-bb59-f4df85ea7605	17983	9.86	t	6.50	2025-10-27 18:01:45.684847
7eab36bd-56a1-45f6-9bba-a56306dcbfa7	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	354673	6.68	t	0.00	2025-10-27 18:01:45.73035
7ba6b13e-cecc-4ce2-a489-595537f9fd08	48fd5bc9-7b30-41e8-a7c5-98387139c979	44790	10.00	t	1.70	2025-10-27 18:01:45.777507
ed9f7877-decb-4254-9e49-7c53c4e36bb7	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	55505	10.00	t	2.30	2025-10-27 18:01:45.828588
1c297d06-78e0-4612-bb3e-8d80b7e03129	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	59260	9.55	t	2.30	2025-10-27 18:01:45.873741
8c62c06e-df32-4345-acac-1b920b0967c5	43b22d3e-4e94-4597-9ac7-76b163c8cd24	55694	9.80	t	2.40	2025-10-27 18:01:45.914681
df246fdf-08ea-494f-b4fb-dc6df5c0190e	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	47744	10.00	t	2.40	2025-10-27 18:01:45.959075
a8575e3e-a4ff-4c5e-b457-31313dbccd63	e6667556-2e70-495e-9a0f-68ec54d7b5f4	12993	9.90	t	8.80	2025-10-27 18:01:46.003502
187c9adf-bdd4-4719-ad14-a8797d1e24b4	00a0edb8-f329-458e-9ead-36904162e7da	24247	9.72	t	2.00	2025-10-27 18:01:46.050426
785547d5-b52f-4210-b2e4-a56055337117	3bd6e77f-cc26-4130-a8be-2f16620f87ef	57085	9.76	t	2.30	2025-10-27 18:01:46.106837
129c3542-b065-4dc2-826f-6e6c82959a51	02a20037-4254-40b0-8310-5d188c664fc9	41050	10.00	t	0.30	2025-10-27 18:01:46.152653
07a71fbf-7d0f-4928-9a6b-bc849edb720f	502a8fee-21f9-42eb-8784-9c4b55ea4f30	16769	9.70	t	0.80	2025-10-27 18:01:46.203649
6a455f42-6649-4627-a8b2-a89a61ad390b	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	39255	9.99	t	0.40	2025-10-27 18:01:46.248143
5c88398b-f306-40c4-9034-8891843e6330	9a76d553-5287-4006-8315-a03392ced768	17592	9.92	t	3.40	2025-10-27 18:01:46.299905
64521f7f-f9af-41cd-a948-a66f6eee27bd	ef784796-f1d8-459b-97c0-2a1b9dea02c1	22967	9.61	t	3.50	2025-10-27 18:01:46.35719
7bcb2c3b-4986-4e0b-9c33-9de56968c779	28045aed-c22a-400a-af25-af765f640bb8	21396	9.72	t	5.30	2025-10-27 18:01:46.415879
b3404d5c-5136-4cee-8d9f-247980a9d0d6	de488477-23b8-484d-90fa-59e29f4e26c5	39521	9.92	t	0.40	2025-10-27 18:01:46.462518
708a5e62-7cb3-4b54-af58-ead179d01b09	c47d2e86-6f9c-4fe3-b718-715da4f65586	19214	9.87	t	4.40	2025-10-27 18:01:46.50526
04ee511f-d860-471e-b897-96ba20cf4e95	0edd9091-a9fc-4bb4-8336-34182dc1c784	189297	3.92	f	\N	2025-10-27 18:01:46.553854
1a2d1488-045e-4b1a-8995-2b012a18cf4f	5d15d55f-1f0e-4757-b774-cb24606f1757	22562	9.78	t	6.20	2025-10-27 18:01:46.597266
35966627-ce7c-4dc4-bceb-31a425e5a39a	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	68590	2.62	t	1.30	2025-10-27 18:01:46.638151
45e55451-4c96-4f64-a9be-fe5db15265f9	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48543	9.72	t	0.00	2025-10-27 18:01:46.679955
5bc74f07-15b1-47fd-9098-57300c3a3203	613a324c-091b-4948-a69b-5144b04bb933	36353	9.64	t	1.20	2025-10-27 18:01:46.728693
4d624298-bac4-47c1-9a3d-e066b7284e05	f3c9a444-0ead-4253-901a-69517f1d4a28	23624	9.29	t	0.20	2025-10-27 18:05:30.339382
b45b8844-e6fd-4e3b-af3e-eeb057daaba7	f3c9a444-0ead-4253-901a-69517f1d4a28	23575	9.32	t	0.40	2025-10-27 18:18:14.625752
40faeb11-df79-4a83-bc49-b7268560d922	df99abe0-2800-4600-901b-e78c125107e1	134143	5.53	t	0.20	2025-10-27 18:31:44.98206
0c4dd437-eccb-46b3-beae-f7bd7cdf5c03	8bc0832a-a821-4ef9-b714-12c4724ac0c1	39747	9.73	t	0.10	2025-10-27 18:31:45.02886
2a2fbe6d-2cd6-4db8-a22b-a93d54cc0618	d64b5f01-b88a-4718-be6f-5d478bc95f1e	96719	3.28	f	\N	2025-10-27 18:31:45.073622
a51cae85-a215-4b7a-9d6d-375f08bbae6a	dcca0736-8e02-444c-83a5-348271d7bb1b	225908	5.09	t	0.50	2025-10-27 18:31:45.11745
0a9036b8-f0f9-45b1-8a77-91399ac063bf	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	22124	9.83	t	6.10	2025-10-27 18:31:45.183437
49321bb4-42d7-4b83-9b1a-825d63a57e57	6225736b-d70a-4635-a9e2-83fd3d045ffe	68042	9.90	t	0.40	2025-10-27 18:31:45.229013
76efe988-b7d1-43aa-ab8d-27bbb1f1eba7	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	51356	9.73	t	0.70	2025-10-27 18:31:45.273886
a8ba8c46-51bd-46ea-b2bf-0630965f1d54	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	49099	9.95	t	2.70	2025-10-27 18:31:45.316732
14569c8e-33d1-425b-9d7d-be12c277628a	f0d37280-6d2b-4568-bf83-64be010be717	24115	9.44	t	3.10	2025-10-27 18:31:45.364198
4ec4e6d9-b4b8-4368-ac53-5aa47b8fba39	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	53325	9.25	t	2.00	2025-10-27 18:31:45.412546
73c8f01b-3a07-46c6-920a-2500b39f3a38	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26223	9.77	t	1.10	2025-10-27 18:31:45.461679
b97192a6-e5fb-4c1b-9cf2-c15ea4e93285	d326149d-4af5-4621-bb59-f4df85ea7605	18350	9.94	t	2.00	2025-10-27 18:31:45.50606
096e1742-3761-4702-9da3-1646267e5b58	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	354197	6.59	t	0.10	2025-10-27 18:31:45.552846
e5917e20-7878-4a00-8ef0-03f1029d5f21	48fd5bc9-7b30-41e8-a7c5-98387139c979	45900	9.84	t	2.50	2025-10-27 18:31:45.599003
f692525c-158b-4ce8-9190-d28e08a94553	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	56700	10.00	t	2.20	2025-10-27 18:31:45.641611
c53ce742-ef2a-4019-8762-68c3518109d4	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	59277	9.50	t	0.00	2025-10-27 18:31:45.682921
e878698e-623d-41b6-8687-b58176c9e98e	43b22d3e-4e94-4597-9ac7-76b163c8cd24	57006	9.94	t	2.40	2025-10-27 18:31:45.733075
a363e624-31ac-4590-8ffd-c7ca31ff1c23	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	48510	10.00	t	1.60	2025-10-27 18:31:45.774296
cd39b902-49ea-4889-937c-135a8ac4845a	e6667556-2e70-495e-9a0f-68ec54d7b5f4	13382	9.92	t	3.00	2025-10-27 18:31:45.813727
33cb3e35-ff22-4e60-9288-f93872a76918	00a0edb8-f329-458e-9ead-36904162e7da	24290	9.64	t	0.20	2025-10-27 18:31:45.854814
941c8666-cfca-4847-99be-6c587947a4ce	3bd6e77f-cc26-4130-a8be-2f16620f87ef	56785	9.96	t	0.50	2025-10-27 18:31:45.895368
f0bf004d-96c8-4973-b9f4-f21cf68559d4	02a20037-4254-40b0-8310-5d188c664fc9	42515	10.00	t	3.60	2025-10-27 18:31:45.935692
b305e2cb-8fe5-41ba-a5c5-158ddf13bf10	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17423	9.61	t	3.90	2025-10-27 18:31:45.983211
e5f94565-a17d-4fc1-83ee-a2d6ef91b174	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	39441	9.99	t	0.50	2025-10-27 18:31:46.025786
105a1aa7-3028-4101-86ee-573547c79407	9a76d553-5287-4006-8315-a03392ced768	18306	9.88	t	4.10	2025-10-27 18:31:46.069841
ea28919f-6bee-4588-b972-532183f0254b	ef784796-f1d8-459b-97c0-2a1b9dea02c1	24380	9.53	t	6.20	2025-10-27 18:31:46.112156
b5dcf0c1-034d-47cf-925f-beda230e2dc0	28045aed-c22a-400a-af25-af765f640bb8	22836	9.53	t	6.70	2025-10-27 18:31:46.153687
db5cc0de-b734-45d2-af4e-4ebdcb7208a9	de488477-23b8-484d-90fa-59e29f4e26c5	40657	10.00	t	2.90	2025-10-27 18:31:46.1958
c402f087-9a41-464a-a04c-e7b83f6d475c	c47d2e86-6f9c-4fe3-b718-715da4f65586	20190	10.00	t	5.10	2025-10-27 18:31:46.236542
52d5bfdc-edff-4b00-99c1-492dee984387	0edd9091-a9fc-4bb4-8336-34182dc1c784	188843	4.11	t	0.20	2025-10-27 18:31:46.280758
858f4611-775d-490e-80ee-437edf805283	5d15d55f-1f0e-4757-b774-cb24606f1757	22333	9.86	t	1.00	2025-10-27 18:31:46.321872
9a29ab8a-e3dc-4382-93f2-e295113d3b38	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	68972	2.75	f	\N	2025-10-27 18:31:46.363745
0a764e0f-0f79-4c07-834b-a072251e9201	b85b749d-d66f-4a88-89cc-c61cfe123d9c	48941	9.75	t	0.80	2025-10-27 18:31:46.404037
fd14c88c-3838-49b4-a0c1-493c8d41e108	613a324c-091b-4948-a69b-5144b04bb933	37716	9.45	t	3.70	2025-10-27 18:31:46.447329
37565a6c-7a44-4bc3-98b8-3606e2b74db8	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	42818	9.76	t	0.10	2025-10-27 18:31:46.486672
290a148c-7539-4fa3-ba2e-8615c64244be	f3c9a444-0ead-4253-901a-69517f1d4a28	25005	9.45	t	6.10	2025-10-27 18:31:46.530545
a7922696-281c-401b-a856-2194bc318155	df99abe0-2800-4600-901b-e78c125107e1	133725	5.72	t	0.30	2025-10-27 18:47:12.694011
24f88575-1f79-44f4-94c4-7f31d8212529	8bc0832a-a821-4ef9-b714-12c4724ac0c1	41142	9.74	t	3.50	2025-10-27 18:47:13.087592
b3a3843a-7768-441c-afea-d066b11a774e	d64b5f01-b88a-4718-be6f-5d478bc95f1e	97909	3.27	t	1.20	2025-10-27 18:47:13.129965
44ff8083-06b7-425a-9676-c1692933e0b2	dcca0736-8e02-444c-83a5-348271d7bb1b	227271	4.99	t	0.60	2025-10-27 18:47:13.173724
6370c636-fdb2-40ad-8fd3-680e5cbfd12e	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	23190	10.00	t	4.80	2025-10-27 18:47:13.215446
94e0173a-94af-4c6f-b3df-9ce4222073e1	6225736b-d70a-4635-a9e2-83fd3d045ffe	68556	9.71	t	0.80	2025-10-27 18:47:13.257707
2e6b4276-e1a4-42ef-8ea4-589c599d0bbd	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	51800	9.54	t	0.90	2025-10-27 18:47:13.302707
afd9e3b0-5026-46e5-b15e-de041812bc4c	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	50324	10.00	t	2.50	2025-10-27 18:47:13.344603
538d7973-5fb8-46da-af66-303121277485	f0d37280-6d2b-4568-bf83-64be010be717	24354	9.46	t	1.00	2025-10-27 18:47:13.386752
8e89c55c-fed7-41ca-a6a5-ad5711429b4d	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	54488	9.16	t	2.20	2025-10-27 18:47:13.42953
49d259bc-ac66-4cd8-bfc7-abbcd169dfbd	55bbf3e2-9acd-4d86-9368-ab41f801b19c	26158	9.78	t	0.20	2025-10-27 18:47:13.47235
a4be9b74-ebb9-4a18-bd6d-42cee689f55f	d326149d-4af5-4621-bb59-f4df85ea7605	18939	9.78	t	3.20	2025-10-27 18:47:13.514118
1687a6ec-7ba1-46cc-a2f4-e5d872dfb740	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	355288	6.61	t	0.30	2025-10-27 18:47:13.560181
02f931d5-a560-4ed5-bc59-3c62fe72466d	48fd5bc9-7b30-41e8-a7c5-98387139c979	47181	10.00	t	2.80	2025-10-27 18:47:13.604158
6a48af4c-69b4-4c04-a09d-09f15971d507	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	56915	9.91	t	0.40	2025-10-27 18:47:13.646337
07f7dad0-b3e1-45d3-a633-79f880193618	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	60433	9.31	t	2.00	2025-10-27 18:47:13.687454
2c16b242-7d43-4c47-a56e-042f4c110651	43b22d3e-4e94-4597-9ac7-76b163c8cd24	57279	10.00	t	0.50	2025-10-27 18:47:13.728662
aea5bf83-dc8b-4583-a404-c09f0bb79ac5	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	48907	9.89	t	0.80	2025-10-27 18:47:13.771595
6c90c2e0-4b31-447e-99de-72b2e93ad5e2	e6667556-2e70-495e-9a0f-68ec54d7b5f4	14589	10.00	t	9.00	2025-10-27 18:47:13.812327
7ca021a1-c732-46c1-aa2b-8480252a6a02	00a0edb8-f329-458e-9ead-36904162e7da	25099	9.81	t	3.30	2025-10-27 18:47:13.855639
e52c1395-9951-4da7-b60a-94ce5bebe971	3bd6e77f-cc26-4130-a8be-2f16620f87ef	57159	9.83	t	0.70	2025-10-27 18:47:13.898305
c750b93a-9419-4c57-a1c6-e1b5e99713c5	02a20037-4254-40b0-8310-5d188c664fc9	43498	10.00	t	2.30	2025-10-27 18:47:13.93897
e03d160d-02a2-403d-a43a-42f58da9c340	502a8fee-21f9-42eb-8784-9c4b55ea4f30	17275	9.43	t	0.80	2025-10-27 18:47:13.982455
2fa0a0c1-f800-4516-9efe-bb80feed26d7	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	39182	9.96	t	0.70	2025-10-27 18:47:14.024026
30d556bc-f228-4ce6-b4df-a6f76f1d63e2	9a76d553-5287-4006-8315-a03392ced768	18049	9.87	t	1.40	2025-10-27 18:47:14.068308
b7cad3f6-6b6f-477f-8d45-ce3573de4bd1	ef784796-f1d8-459b-97c0-2a1b9dea02c1	25522	9.43	t	4.70	2025-10-27 18:47:14.107785
9a3577c9-3aa9-40af-9225-e1dbf403bc80	28045aed-c22a-400a-af25-af765f640bb8	22796	9.39	t	0.20	2025-10-27 18:47:14.154306
fef7822d-0e5f-472c-92e1-5bc0fde0b813	de488477-23b8-484d-90fa-59e29f4e26c5	40622	9.83	t	0.10	2025-10-27 18:47:14.196462
155a0d2e-d0bb-418d-b632-03294c00eddf	c47d2e86-6f9c-4fe3-b718-715da4f65586	21286	10.00	t	5.40	2025-10-27 18:47:14.23932
89a71bc9-581d-40bd-8b36-f8cd268ffab7	0edd9091-a9fc-4bb4-8336-34182dc1c784	190141	4.07	t	0.70	2025-10-27 18:47:14.284773
85c7ce30-3364-4c44-8cd5-9c424e686d7f	5d15d55f-1f0e-4757-b774-cb24606f1757	23456	9.68	t	5.00	2025-10-27 18:47:14.327546
cc5fb78b-de52-4c0a-bb26-8dd2406d41a1	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	69054	2.93	f	\N	2025-10-27 18:47:14.371525
fd5ad28f-e4e5-4cb5-bef4-2e799e62900e	b85b749d-d66f-4a88-89cc-c61cfe123d9c	49258	9.82	t	0.60	2025-10-27 18:47:14.412761
18db4c7f-4657-4af1-bd2a-aca23b9195e1	613a324c-091b-4948-a69b-5144b04bb933	37602	9.26	t	0.30	2025-10-27 18:47:14.455633
c07b6bc2-629f-4288-b0f7-bad6ad3a1d28	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	42502	9.95	t	0.70	2025-10-27 18:47:14.498887
893c0cc2-a530-448f-be5d-faf8aa99daa4	f3c9a444-0ead-4253-901a-69517f1d4a28	25780	9.29	t	3.10	2025-10-27 18:47:14.542919
56d73bf3-f098-4f2c-ab6d-7aff5a937ce8	8bc0832a-a821-4ef9-b714-12c4724ac0c1	41133	9.79	t	0.00	2025-10-27 18:51:36.167786
77649e33-d88b-4bac-bc7d-9eb96472ce03	d64b5f01-b88a-4718-be6f-5d478bc95f1e	99254	3.30	t	1.40	2025-10-27 20:24:22.815944
\.


--
-- Data for Name: kols; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kols (id, name, handle, avatar, followers, engagement_rate, tier, trending, trending_percent, kolscan_rank, kolscan_wins, kolscan_losses, kolscan_sol_gain, kolscan_usd_gain, last_scraped_at, scraped_from_kolscan) FROM stdin;
d64b5f01-b88a-4718-be6f-5d478bc95f1e	Alex Morgan	alexmorgan	https://api.dicebear.com/7.x/avataaars/svg?seed=alex	97909	3.27	Rising	t	1.20	\N	\N	\N	\N	\N	\N	f
dcca0736-8e02-444c-83a5-348271d7bb1b	Jordan Lee	jordanlee	https://api.dicebear.com/7.x/avataaars/svg?seed=jordan	227271	4.99	Elite	t	0.60	\N	\N	\N	\N	\N	\N	f
777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	iconXBT	iconxbt	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=iconxbt	19737	66.67	Rookie	f	3.46	4	36	18	+34.61	6721.1	2025-10-29 02:00:07.004	t
6225736b-d70a-4635-a9e2-83fd3d045ffe	Inside Calls	insidecalls	https://api.dicebear.com/7.x/avataaars/svg?seed=insidecalls	68556	9.71	Rookie	t	0.80	14	5	4	+13.05	2671.2	2025-10-27 02:05:07.62	t
bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Pandora	pandora	https://api.dicebear.com/7.x/avataaars/svg?seed=pandora	51800	9.54	Rookie	t	0.90	19	20	28	+9.42	1928.1	2025-10-27 02:05:07.84	t
b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Kadenox	kadenox	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=kadenox	53439	41.38	Rookie	f	1.50	18	24	34	+14.99	2912.0	2025-10-28 23:15:33.325	t
b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	slingoor.usduc	slingoor.usduc	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=slingoor.usduc	31903	58.82	Rookie	f	3.94	2	10	7	+39.35	7641.9	2025-10-29 02:00:06.978	t
48fd5bc9-7b30-41e8-a7c5-98387139c979	Gake	gake	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=gake	11460	100.00	Rookie	f	3.26	5	11	0	+32.57	6326.2	2025-10-28 23:15:33.193	t
de488477-23b8-484d-90fa-59e29f4e26c5	M A M B A 🧲	mamba🧲	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=mamba🧲	30653	95.11	Rookie	f	4.29	7	719	37	+42.86	8635.8	2025-10-28 02:00:05.537	t
38de6f69-7a16-4cbb-b8ba-f213f63fc65e	Taylor Swift	taylorswift	https://api.dicebear.com/7.x/avataaars/svg?seed=taylor	355288	6.61	Legendary	t	0.30	\N	\N	\N	\N	\N	\N	f
c47d2e86-6f9c-4fe3-b718-715da4f65586	big bags bobby	bigbagsbobby	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=bigbagsbobby	13754	66.67	Rookie	f	2.43	6	6	3	+24.28	4714.1	2025-10-29 02:00:07.03	t
c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	DJ.Σn	dj.σn	https://api.dicebear.com/7.x/avataaars/svg?seed=dj.σn	56915	9.91	Rookie	t	0.40	8	53	3	+26.54	5316.6	2025-10-27 15:44:21.012	t
502a8fee-21f9-42eb-8784-9c4b55ea4f30	zhynx	zhynx	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=zhynx	47754	100.00	Rookie	f	9.97	1	5	0	+99.72	19363.0	2025-10-29 02:00:06.961	t
f0d37280-6d2b-4568-bf83-64be010be717	BIGWARZ	bigwarz	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=bigwarz	29951	15.38	Rookie	f	1.61	20	2	11	+16.07	3236.9	2025-10-28 02:00:05.71	t
02a20037-4254-40b0-8310-5d188c664fc9	Jidn	jidn	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jidn	32800	60.00	Rookie	f	2.86	10	6	4	+28.62	5766.7	2025-10-28 02:00:05.576	t
43b22d3e-4e94-4597-9ac7-76b163c8cd24	Ban	ban	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=ban	32515	80.00	Rookie	f	1.62	19	4	1	+16.17	3258.7	2025-10-28 02:00:05.697	t
00a0edb8-f329-458e-9ead-36904162e7da	oscar	oscar	https://api.dicebear.com/7.x/avataaars/svg?seed=oscar	25099	9.81	Rookie	t	3.30	18	16	21	+9.77	1999.8	2025-10-27 02:05:07.797	t
d326149d-4af5-4621-bb59-f4df85ea7605	rayan	rayan	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=rayan	18045	47.37	Rookie	f	4.80	6	9	10	+48.02	9674.9	2025-10-28 02:00:05.523	t
9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Letterbomb	letterbomb	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=letterbomb	26566	36.00	Rookie	f	1.95	14	18	32	+19.50	3929.6	2025-10-28 02:00:05.628	t
14422aeb-caa1-44e6-9df0-b33ccb41dd12	gr3g	gr3g	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=gr3g	50995	96.88	Rookie	f	8.05	3	93	3	+80.49	15633.7	2025-10-28 23:15:33.171	t
27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	N’o	n’o	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=n’o	58067	40.00	Rookie	f	1.56	11	4	6	+15.60	3028.9	2025-10-29 02:00:07.094	t
9a76d553-5287-4006-8315-a03392ced768	dv	dv	https://api.dicebear.com/7.x/avataaars/svg?seed=dv	18049	9.87	Rookie	t	1.40	15	27	34	+17.11	3427.9	2025-10-27 15:44:21.371	t
ef784796-f1d8-459b-97c0-2a1b9dea02c1	Heyitsyolo	heyitsyolo	https://api.dicebear.com/7.x/avataaars/svg?seed=heyitsyolo	25522	9.43	Rookie	t	4.70	19	27	32	+12.57	2517.2	2025-10-27 15:44:21.589	t
28045aed-c22a-400a-af25-af765f640bb8	Files	files	https://api.dicebear.com/7.x/avataaars/svg?seed=files	22796	9.39	Rookie	t	0.20	3	8	16	+33.79	6768.3	2025-10-27 15:44:20.736	t
6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Unknown	unknown	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=unknown	44953	76.92	Rookie	f	3.09	9	10	3	+30.95	6236.5	2025-10-28 02:00:05.563	t
5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Kev	kev	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=kev	41848	74.77	Rookie	f	2.98	5	243	82	+29.78	5782.4	2025-10-29 02:00:07.016	t
0edd9091-a9fc-4bb4-8336-34182dc1c784	Emma Watson	emmawatson	https://api.dicebear.com/7.x/avataaars/svg?seed=emma	190141	4.07	Elite	t	0.70	\N	\N	\N	\N	\N	\N	f
5d15d55f-1f0e-4757-b774-cb24606f1757	kitty	kitty	https://api.dicebear.com/7.x/avataaars/svg?seed=kitty	23456	9.68	Rookie	t	5.00	20	1	0	+12.31	2465.5	2025-10-27 15:39:07.586	t
ad3886f9-7faf-433d-ae54-8fa0b6036f8f	Chris Evans	chrisevans	https://api.dicebear.com/7.x/avataaars/svg?seed=chris	69054	2.93	Growing	f	\N	\N	\N	\N	\N	\N	\N	f
b85b749d-d66f-4a88-89cc-c61cfe123d9c	Scharo	scharo	https://api.dicebear.com/7.x/avataaars/svg?seed=scharo	49258	9.82	Rookie	t	0.60	11	31	31	+15.43	3157.3	2025-10-27 02:05:07.487	t
0f08bb54-8367-46f1-b980-a98e935778c4	Danny	danny	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=danny	47978	36.59	Rookie	f	6.40	3	15	26	+63.95	12883.9	2025-10-28 02:00:05.482	t
e6667556-2e70-495e-9a0f-68ec54d7b5f4	Cented	cented	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=cented	44130	48.00	Rookie	f	1.46	13	96	104	+14.62	2838.4	2025-10-29 02:00:07.117	t
f3c9a444-0ead-4253-901a-69517f1d4a28	Publix	publix	https://api.dicebear.com/7.x/avataaars/svg?seed=publix	25780	9.29	Rookie	t	3.10	13	24	26	+14.17	2899.6	2025-10-27 02:05:07.576	t
8bc0832a-a821-4ef9-b714-12c4724ac0c1	Trenchman	trenchman	https://api.dicebear.com/7.x/avataaars/svg?seed=trenchman	41133	9.79	Rookie	t	0.00	20	9	27	+11.31	2264.7	2025-10-27 15:44:21.635	t
df99abe0-2800-4600-901b-e78c125107e1	Sarah Chen	sarahchen	https://api.dicebear.com/7.x/avataaars/svg?seed=sarah	133725	5.72	Elite	t	0.30	\N	\N	\N	\N	\N	\N	f
613a324c-091b-4948-a69b-5144b04bb933	West	west	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=west	12585	45.05	Rookie	f	8.75	2	41	50	+87.52	17633.1	2025-10-28 02:00:05.464	t
31c67b34-da6a-4223-96e5-bc014f7773d0	aloh	aloh	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=aloh	50345	31.58	Rookie	f	5.56	4	30	65	+55.58	11198.4	2025-10-28 02:00:05.495	t
3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo	jijo	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jijo	41689	60.61	Rookie	f	4.91	5	20	13	+49.13	9897.5	2025-10-28 02:00:05.506	t
d8629eb3-c067-4dbd-96c1-7857a8ad716f	Cooker	cooker	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=cooker	18919	72.22	Rookie	f	1.86	15	13	5	+18.60	3746.4	2025-10-28 02:00:05.642	t
e8b3cdff-6c8e-4eeb-9a4b-b1e7f0bec093	Pain	pain	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=pain	40943	80.00	Rookie	f	1.78	17	4	1	+17.78	3582.4	2025-10-28 02:00:05.669	t
2401af33-61c9-443b-9e2f-c4f8a312792e	WaiterG	waiterg	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=waiterg	10970	83.33	Rookie	f	8.55	2	215	43	+85.55	16616.3	2025-10-28 23:15:33.145	t
a5e16c37-a634-4ce3-a3fc-57f972fd10fc	ozark	ozark	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=ozark	46125	98.23	Rookie	f	2.71	7	556	10	+27.10	5264.1	2025-10-28 23:15:33.212	t
5f1b471e-824c-4f87-b996-834147d61a66	Jeets	jeets	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jeets	41003	64.71	Rookie	f	1.93	15	11	6	+19.34	3755.4	2025-10-28 23:15:33.295	t
a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Beaver	beaver	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=beaver	28281	22.54	Rookie	f	1.78	16	16	55	+17.76	3448.5	2025-10-28 23:15:33.305	t
e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	radiance	radiance	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=radiance	12094	22.22	Rookie	f	1.70	17	4	14	+17.05	3312.1	2025-10-28 23:15:33.315	t
fe853fd3-8ea4-4a84-a12d-5004e40ec4c1	h14	h14	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=h14	33181	20.00	Rookie	f	3.48	3	8	32	+34.75	6746.9	2025-10-29 02:00:06.991	t
8dde432d-15ac-421a-b758-82f772df4b0d	clukz	clukz	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=clukz	31816	16.67	Rookie	f	2.13	7	2	10	+21.33	4141.8	2025-10-29 02:00:07.043	t
e01c26b6-ede0-4b84-ae60-9af4b7ca0cd7	Little Mustacho 🐕	littlemustacho🐕	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=littlemustacho🐕	40689	28.57	Rookie	f	2.01	8	2	5	+20.11	3904.5	2025-10-29 02:00:07.057	t
333046b1-5768-4cd5-8e8e-b160f88a1146	lucas	lucas	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=lucas	33454	75.00	Rookie	f	1.89	9	3	1	+18.94	3677.9	2025-10-29 02:00:07.069	t
6a2a833b-9f09-4589-9f2a-7dba1743f31f	waste management	wastemanagement	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=wastemanagement	36776	42.86	Rookie	f	1.75	10	3	4	+17.46	3390.7	2025-10-29 02:00:07.082	t
55bbf3e2-9acd-4d86-9368-ab41f801b19c	Sheep	sheep	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=sheep	10011	99.78	Rookie	f	1.53	12	17742	39	+15.32	2974.9	2025-10-29 02:00:07.105	t
1b094c8a-34a0-4e32-85c9-97a3d92fb8fd	Veloce	veloce	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=veloce	35740	28.57	Rookie	f	1.46	14	4	10	+14.58	2831.2	2025-10-29 02:00:07.128	t
4e3a74b0-8dbe-4321-80d2-e40688912822	blixze ♱	blixze♱	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=blixze♱	57357	60.00	Rookie	f	1.40	15	6	4	+14.04	2726.0	2025-10-29 02:00:07.143	t
8fe511e2-5430-4344-95cd-6067927b808b	Rev	rev	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=rev	34363	100.00	Rookie	f	1.30	16	1	0	+12.99	2522.7	2025-10-29 02:00:07.154	t
505dc9bb-d2af-48d2-90c7-652476d5e208	Ethan Prosper	ethanprosper	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=ethanprosper	10302	48.39	Rookie	f	1.22	17	15	16	+12.18	2365.4	2025-10-29 02:00:07.165	t
a87eb3fb-4574-4e9e-8948-a01fa697ff5f	jester	jester	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jester	28057	66.67	Rookie	f	1.21	18	2	1	+12.09	2347.4	2025-10-29 02:00:07.177	t
a96fc177-ac49-4488-a316-361d14cbed4a	para	para	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=para	53810	42.86	Rookie	f	1.07	19	3	4	+10.68	2074.0	2025-10-29 02:00:07.19	t
eb49a533-b43c-437e-87bc-1c11bc7e7dd9	mog	mog	https://api.dicebear.com/9.x/notionists-neutral/svg?seed=mog	31517	25.00	Rookie	f	0.99	20	1	3	+9.91	1925.0	2025-10-29 02:00:07.201	t
\.


--
-- Data for Name: market_metadata; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.market_metadata (id, market_id, market_type, kol_a, kol_b, x_handle, current_followers, current_rank_a, current_rank_b, current_usd, current_sol_a, current_sol_b, current_usd_a, current_usd_b, current_wins_losses_a, current_wins_losses_b, threshold, timeframe_days, created_at) FROM stdin;
cf9b61b7-0397-4be3-81a5-af5ff3acc840	feabb979-da3f-4539-84d6-690103c48653	rank_flippening	zhynx	Kadenox	\N	\N	9	7	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:05:47.073458
a63b78b2-fc80-4d5a-86f9-c793a9ad1ece	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	sol_gain_flippening	Pandora	Gake	\N	\N	\N	\N	\N	+9.42	+8.61	\N	\N	\N	\N	\N	\N	2025-10-27 02:05:47.450236
19ecb30e-0b1d-45ba-8ce5-d634916d669a	58cec4b3-acd8-4b70-8927-ccb3a4f10853	profit_streak	Kev	\N	\N	\N	\N	\N	1662.7	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:05:47.519448
54cbfd50-b3ba-46a1-b34b-25ba6697dc49	456738cb-8f52-48d8-b9e6-7e4858d1b78a	sol_gain_threshold	Sheep	\N	\N	\N	\N	\N	\N	+11.20	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 02:05:47.894446
11e53296-5d61-4f49-9cbd-c61d548b797f	7133d2f0-ec8c-4d98-89e6-80066f67e843	rank_improvement	dv	\N	\N	\N	16	\N	\N	\N	\N	\N	\N	\N	\N	6.00	\N	2025-10-27 02:05:48.266149
6ef2ca98-78d5-4d64-b86c-48340d1799d0	b209641d-7db6-4c37-86e9-c2f3c6372747	streak_continuation	oscar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16/21	\N	\N	\N	2025-10-27 02:05:48.633107
77eacbd6-bbdc-4936-b1a2-d59499a2a346	5adddbff-eed3-40b2-b1f2-0c148645df59	top_rank_maintain	Cented	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 02:05:49.008345
73bc9702-87f4-4adb-ac54-25d865da13f0	81293c70-4c55-4226-8265-94bb83ee21c4	winloss_ratio_maintain	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/12	\N	2.50	\N	2025-10-27 02:05:49.37898
96f36d11-27c2-4800-b18e-f99ba5b905a4	d89930a8-c382-4344-8e95-3a6940e9e50b	streak_continuation	Files	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3/12	\N	\N	\N	2025-10-27 02:05:49.748901
b66d6fb4-8041-4875-818d-46bbb767b4f6	fde9d18f-74e4-4ee6-9ea4-daa3029c3a9b	sol_gain_threshold	DJ.Σn	\N	\N	\N	\N	\N	\N	+24.74	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 02:05:50.121754
c0f7ae6b-6189-4120-af6d-bbea176d8547	1bc15a56-4869-4ec9-9bad-9c3f58b0f9cb	profit_streak	Inside Calls	\N	\N	\N	\N	\N	2671.2	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:05:50.488961
d1e97aa2-0eb4-42c7-a5e9-02400ca9f5ef	50d39c4f-c935-4376-a1b6-608e8a179305	rank_improvement	kitty	\N	\N	\N	12	\N	\N	\N	\N	\N	\N	\N	\N	2.00	\N	2025-10-27 02:05:50.857519
3f454daf-ca99-4fa8-aeb7-3fd9747bff6e	4e84b9ad-cbec-4176-9419-6b78361620aa	top_rank_maintain	Jijo	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 02:05:51.2257
15f9125e-3a05-4a56-8127-6741b8776fc6	5ee05adf-f78b-4f62-9fed-45c290c8d1da	winloss_ratio_maintain	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/3	\N	1.75	\N	2025-10-27 02:05:51.592671
748fb41d-df06-4a84-aa55-eff8c79febe3	4324e0fa-14ec-4390-8fb3-6e01299da9d1	profit_streak	N’o	\N	\N	\N	\N	\N	5371.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:05:51.964674
d99d0112-4d66-4fcd-b520-a8aeee4a24ab	2c0c1f90-211d-4ab7-bd4a-d1135d1637b7	rank_improvement	BIGWARZ	\N	\N	\N	15	\N	\N	\N	\N	\N	\N	\N	\N	5.00	\N	2025-10-27 02:05:52.331438
c4f554d5-a764-458c-a3c3-bef971b5808f	cf8cc358-d50b-4fe2-aeb6-623aa44bbdc4	sol_gain_threshold	West	\N	\N	\N	\N	\N	\N	+22.58	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 02:05:52.696246
338a1887-aa48-4756-a8bf-113572999339	a967c1ec-cb76-4f0e-a4be-ea5017db573d	streak_continuation	Scharo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	31/31	\N	\N	\N	2025-10-27 02:05:53.067692
fa615597-cde2-4f83-a6ec-cbed400118a6	d78618ae-3daf-4ec6-98c9-46c38dc247ea	top_rank_maintain	M A M B A 🧲	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 02:05:53.437399
256ea668-9d58-4928-a0c7-3daad615c81f	37b861df-7fba-4a34-a46d-d957b704f158	sol_gain_flippening	Publix	Sheep	\N	\N	\N	\N	\N	+14.17	+11.20	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:46.383223
e981f1bd-aacd-4dc6-90dd-e178d89197bc	5a961b9b-4511-43e3-89ea-b256af754d26	winloss_ratio_flippening	Kev	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	5/4	\N	\N	2025-10-27 02:25:46.756982
c33d7c8b-1619-414e-87db-13e5d68502d8	d8c15dc6-f31b-4cde-8593-fc5a5d092544	profit_streak	Scharo	\N	\N	\N	\N	\N	3157.3	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:46.831446
e5e38108-d78a-4ddb-ba7b-40db3a245299	ecb9de96-1831-4216-92ea-db33c97ec879	streak_continuation	Files	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3/12	\N	\N	\N	2025-10-27 02:25:47.200464
5b6abf49-8ac2-4fc8-a547-285c01912589	45477e01-386d-413f-b0f7-e6fbb8dd029f	sol_gain_threshold	Kadenox	\N	\N	\N	\N	\N	\N	+24.02	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 02:25:47.580564
94f91b73-551f-4935-9a1a-858929bfeb74	4c7b463b-ba58-4582-bab5-5a00b1e864f6	rank_improvement	big bags bobby	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	9.00	\N	2025-10-27 02:25:47.948634
2404d9e8-d866-463a-a841-60e698bd053a	2c86c4a0-064b-4e5b-bc50-ef02875f55ce	winloss_ratio_maintain	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/12	\N	2.50	\N	2025-10-27 02:25:48.317167
382430a1-65e2-4526-9c6f-4da4354a8dd7	89a98418-2a3f-46a7-b955-eb531e5bada9	top_rank_maintain	West	\N	\N	\N	8	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 02:25:48.682293
cc81c15a-ed28-49bf-bfe7-9731fde9b480	960d3292-0d7e-4809-93d6-0416cd922712	sol_gain_threshold	Jijo	\N	\N	\N	\N	\N	\N	+50.20	\N	\N	\N	\N	\N	100.00	\N	2025-10-27 02:25:49.045478
5c5907a8-3f16-4a61-9207-6e7467e5bc38	9d274565-4c16-432b-9347-f46cf7e164b6	rank_improvement	kitty	\N	\N	\N	12	\N	\N	\N	\N	\N	\N	\N	\N	7.00	\N	2025-10-27 02:25:49.413422
a692a474-4112-4d0b-b851-41dca946792f	77cbff65-7b61-4c7a-ba9d-b8c733d83827	profit_streak	oscar	\N	\N	\N	\N	\N	1999.8	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:49.779462
0101a61d-1dc8-4d96-ae9c-1094452d5a15	50b4cd9e-3b6d-4a0c-8fbf-eb22040801b0	streak_continuation	Pandora	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20/28	\N	\N	\N	2025-10-27 02:25:50.146793
a8dbdc93-6544-4b7e-9476-2e9a3635ae4f	c1a1e06b-d9dc-4488-9896-4862d125be5e	top_rank_maintain	zhynx	\N	\N	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 02:25:50.517026
49ad6c47-1f4b-478d-a0f6-049fc1a268dd	c3a706e4-7bdd-4b01-823e-6c57f95f1657	rank_flippening	Cented	Gake	\N	\N	3	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:50.883735
ae11cef5-8294-43ed-96de-7a1b23a00e47	38dc4742-bc63-41a0-8a86-d871fce0684d	rank_flippening	N’o	DJ.Σn	\N	\N	5	6	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:51.253526
35b6fb5e-42fd-41ca-b7f2-4c8a08be44c5	d0022d4b-77f3-4222-b8c4-665ea71301eb	rank_flippening	dv	M A M B A 🧲	\N	\N	16	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 02:25:51.627206
addee8e7-8daa-40fa-8f22-a18fdd2634a4	76f3559b-343e-41af-aa3e-e32f6a08137a	usd_gain_flippening	Sheep	Files	\N	\N	\N	\N	\N	\N	\N	2291.4	6716.6	\N	\N	\N	\N	2025-10-27 15:37:19.405588
de0ed1e5-6087-4bf2-9984-b85816479196	fd348275-09eb-4fe6-8eae-3bec3c4b6f29	winrate_flippening	zhynx	kitty	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/0	1/0	\N	\N	2025-10-27 15:37:19.830813
c86f9d34-31f1-480e-b8b0-b97069349186	11ce2199-af30-401b-a2f8-8afc3aadcf3a	sol_gain_threshold	Jijo	\N	\N	\N	\N	\N	\N	+50.20	\N	\N	\N	\N	\N	100.00	\N	2025-10-27 15:37:19.953593
0253972f-e11c-4231-8432-aa5148474e6b	dfb61d88-73eb-4b25-93b0-bc81a60c510f	rank_improvement	dv	\N	\N	\N	16	\N	\N	\N	\N	\N	\N	\N	\N	6.00	\N	2025-10-27 15:37:20.363465
370276cc-8a64-4938-a2cc-888b4482506b	a439f241-92d3-44e7-b392-6d9d9cbc7e74	top_rank_maintain	West	\N	\N	\N	8	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:37:20.743811
73bd8670-6c55-4e97-8624-79e3b0c88294	b779a386-ce8e-4d5f-b846-4cbc667cce00	streak_continuation	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/12	\N	\N	\N	2025-10-27 15:37:21.129916
8667267e-5924-491d-95de-cdc512b3d62b	727e5c73-c2f1-4bcd-9425-53e3dde37f87	profit_streak	Gake	\N	\N	\N	\N	\N	1760.4	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:37:21.515648
c42ee279-917d-41ec-9edb-fd02e374f76f	883272c7-f0a8-4e1c-9dd3-51643615c95c	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	\N	2.50	\N	2025-10-27 15:37:21.907256
5844b38f-93a1-49cb-8922-f5d089ea726f	3b4bfa63-f52b-4c91-b0c7-51ff378f9fde	rank_improvement	DJ.Σn	\N	\N	\N	6	\N	\N	\N	\N	\N	\N	\N	\N	1.00	\N	2025-10-27 15:37:22.286903
a624c641-54a0-4b40-8636-5f0f3c1f7ee4	ecf23f5a-aeb4-48f3-b34e-1d2d74ab0679	streak_continuation	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	\N	\N	2025-10-27 15:37:22.680516
a83b6d52-a670-4778-91a8-9d3f542a5d40	39a67c6c-dfd9-41a5-af54-d0f76a3b1c4d	sol_gain_threshold	Pandora	\N	\N	\N	\N	\N	\N	+9.42	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:37:23.06045
72d2f402-ad69-4474-bf71-af883f52a6f4	e64f7355-2761-4e2a-a3c7-c5a57b67f16a	profit_streak	Cented	\N	\N	\N	\N	\N	7379.7	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:37:23.508647
9136b78b-e9ae-439d-9a9d-b4e58d5b51b7	7118ceb6-e108-4b45-9438-b684f2e0d12d	top_rank_maintain	N’o	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:37:23.897705
8c3576af-c892-4d00-b9cd-973f7082b3e4	426c9981-2982-4fc6-b0b7-b236e6b3300c	winloss_ratio_maintain	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/3	\N	1.75	\N	2025-10-27 15:37:24.287525
d7be01e6-98c1-4a8f-b8b7-f78bf621ffb6	b3dbb2cc-dedb-4d31-87d0-cd16e9e3265d	sol_gain_threshold	BIGWARZ	\N	\N	\N	\N	\N	\N	+12.52	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:37:24.666439
2853dc9e-b96a-4dc5-b444-7148a8534e21	251f7f93-cfdf-4f0d-8eb6-e45be86c7a1e	profit_streak	oscar	\N	\N	\N	\N	\N	1999.8	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:37:25.06625
b18e97c5-b6dd-4b13-9da7-5600999bcc13	17c99a79-7fec-4579-95d4-0e60403cc92d	top_rank_maintain	M A M B A 🧲	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:37:25.457049
26eba2cf-5a97-44e3-a667-8fbdd36bff77	5d180dfc-a5a8-4132-9919-522bd2eea739	streak_continuation	Scharo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	31/31	\N	\N	\N	2025-10-27 15:37:25.860558
c4fe5b39-9bf3-41bc-a9d9-5dcc89f3725b	f045c092-2ad9-42bc-93ec-1bf321e1f3d3	rank_improvement	Publix	\N	\N	\N	13	\N	\N	\N	\N	\N	\N	\N	\N	3.00	\N	2025-10-27 15:37:26.245175
8ce0eec4-aefc-43f0-bb41-1d1923cbc9da	b9b2ec8f-aaa2-4396-90ba-392019170e86	sol_gain_flippening	Ban	Jidn	\N	\N	\N	\N	\N	+30.88	+12.31	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:18.459061
6eeff406-9a93-43b8-83ea-e094e8646671	b0804955-ebdc-4a9b-9f11-77f349f8c79e	usd_gain_flippening	Heyitsyolo	Jijo	\N	\N	\N	\N	\N	\N	\N	2517.7	6699.3	\N	\N	\N	\N	2025-10-27 15:41:18.83657
d71c505c-7300-4463-831c-7fc650bf8004	8e0bbe13-2111-4548-9133-c27a5831c9a5	profit_streak	Kadenox	\N	\N	\N	\N	\N	3654.4	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:18.910586
7cd62f37-5355-45c0-95fd-f5f576513895	30a23afb-0f6f-45f0-8872-d920c04eb2d7	sol_gain_threshold	zhynx	\N	\N	\N	\N	\N	\N	+18.55	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:41:19.281426
b4b78d88-7a84-41cb-bf16-dba7102cea79	6a421238-5aee-4467-b16e-2b0a2e158cbc	streak_continuation	M A M B A 🧲	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	713/43	\N	\N	\N	2025-10-27 15:41:19.684624
061f3e22-85c4-455f-ba49-a2fafbc72d22	70a7b8cd-8b3a-4308-bbf1-aa1942d5230f	rank_improvement	Unknown	\N	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	7.00	\N	2025-10-27 15:41:20.081421
b1db13a2-5453-44c3-9f79-2cafdf3a79c6	9bf46ebc-9f56-4600-b0db-99fb025da447	top_rank_maintain	Sheep	\N	\N	\N	7	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:41:20.461361
b8d13724-b3fe-4d79-9f16-3dcced061a68	a428625b-26ad-4f5a-89a3-f17662243bfb	winloss_ratio_maintain	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	1.50	\N	2025-10-27 15:41:20.837148
662505ce-2950-4c32-83cc-b4cf9a494dc4	14317835-9133-4f2d-b7fd-75eae67d10b7	profit_streak	rayan	\N	\N	\N	\N	\N	2482.4	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:21.276194
22da7991-2ef0-4837-824f-589c9adce3e0	ebd4e724-173a-4249-aa91-9bc509f349d4	sol_gain_threshold	Publix	\N	\N	\N	\N	\N	\N	+14.17	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:41:21.664457
60ee48ca-2155-4adf-a0da-f3d3ce7f79d5	dd11efbb-8b49-45ff-ac6d-dba4e4e124e8	rank_improvement	iconXBT	\N	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	5.00	\N	2025-10-27 15:41:22.047831
007845b9-f758-4947-960a-a234660b6b89	990ccf04-677e-4c29-b523-cc723a054c24	streak_continuation	Cented	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	35/34	\N	\N	\N	2025-10-27 15:41:22.421914
aa69c269-de9e-4b72-a52f-02432a922f1e	e2c56d90-4caf-40fb-a6d6-608be9c982fa	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	\N	2.50	\N	2025-10-27 15:41:22.80787
88f52c19-e2c9-46ef-aecc-3247bc4d0b19	e3058e6f-3666-4a07-b2d9-39a2ce44617a	top_rank_maintain	DJ.Σn	\N	\N	\N	8	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:41:23.185064
772c71ae-3fdf-451d-b58f-d2cb82229dbc	9e59a9cf-ebf6-4f78-8b4f-a368105ba2b8	profit_streak	Gake	\N	\N	\N	\N	\N	3987.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:23.551732
d0e04d74-7831-4346-8cfa-5040c612f427	2cd3b9a6-a0af-4744-a90b-f135947d3574	sol_gain_threshold	Files	\N	\N	\N	\N	\N	\N	+33.24	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:41:23.921253
973b5543-3fd7-460f-832c-c3276b6aadc4	b61fff24-42a7-4c39-9096-1edbf5853a24	rank_improvement	kitty	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	15.00	\N	2025-10-27 15:41:24.307569
f9f1b37d-c395-430b-8630-2079321cab82	a164989f-90de-41fa-80e1-616c6e83c50a	streak_continuation	Trenchman	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9/27	\N	\N	\N	2025-10-27 15:41:24.75844
1b712a87-0171-42eb-8c92-f109be544148	93ced1e3-7dcd-47e1-a054-2a6eef9fc4fa	winloss_ratio_maintain	N’o	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/6	\N	1.50	\N	2025-10-27 15:41:25.148178
6efbc0f2-f425-4bc7-ae66-5427f469b5cf	1ce18c6f-8673-4f73-8a2d-5097f34fca38	top_rank_maintain	West	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:41:25.546963
81c40669-e574-467e-9ca3-1aa7cf9f340a	366dafe7-0cc6-489d-bab0-d19b1f2085fa	rank_improvement	Letterbomb	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	16.00	\N	2025-10-27 15:41:25.936219
bcdc773b-757f-4a71-9a7b-f8372512b6df	fe31dcc2-ea50-440f-8532-a9078ca50701	profit_streak	Pandora	\N	\N	\N	\N	\N	1928.1	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:26.323632
78975b12-ed1d-404c-9364-cd09551bdec2	6d014d91-9120-43c7-8ffc-c63229aaad24	winloss_ratio_maintain	slingoor.usduc	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/1	\N	1.75	\N	2025-10-27 15:41:26.691361
1c41b96a-be2d-405f-aff9-3e4cf6a0da2d	ea3997c0-de42-4653-a2b8-92f612812ad7	sol_gain_threshold	big bags bobby	\N	\N	\N	\N	\N	\N	+38.05	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:41:27.14379
a632ef8b-df33-46da-aa60-8153da4880bf	88832a98-4a9a-45ca-9e24-ffe9ce05ab12	streak_continuation	oscar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16/21	\N	\N	\N	2025-10-27 15:41:27.536961
ed96bd65-473e-4862-8d0f-9700520d6510	99b71b74-2943-43ef-9305-002a3445403f	rank_flippening	Scharo	dv	\N	\N	11	15	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:41:27.910514
ca816516-be98-45ec-b8dd-027748c10689	5f065c8c-c8be-492a-a5ec-ae35c17ff042	winrate_flippening	Ban	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/5	34/12	\N	\N	2025-10-27 15:45:27.608848
ab3f608c-c5ce-4f3f-bc17-3dd6e73b29c4	98fe4f74-30a8-49ca-b082-0baac9132cc1	winloss_ratio_flippening	big bags bobby	BIGWARZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	7/5	1/3	\N	\N	2025-10-27 15:45:27.99566
00394697-fef0-42f6-a05a-51039f5e9710	9ede9f7a-a5e3-42de-8b4a-808b9f251e05	sol_gain_threshold	slingoor.usduc	\N	\N	\N	\N	\N	\N	+16.72	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:45:28.07013
b5634fb5-a9cf-4f68-91b0-b72d8d19d444	3395a3a6-746b-4e05-9342-7abd54234601	profit_streak	Trenchman	\N	\N	\N	\N	\N	2264.7	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:28.452717
3adff835-c808-419d-b005-993f422e7bde	5f475065-67df-48f7-9ff0-7c3e21a10e61	rank_improvement	Kev	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	15.00	\N	2025-10-27 15:45:28.827304
2274a820-0cae-40fc-8154-2a7dbfcb56fe	976ed7fb-ea95-4f1d-8252-4f5c492f3f4b	streak_continuation	oscar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16/21	\N	\N	\N	2025-10-27 15:45:29.206854
9c803d60-1ea2-4efc-be54-19ba34d0194d	9eddb4ed-8e10-48e7-abf3-3621f24319bb	top_rank_maintain	Sheep	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:45:29.584185
db71ca41-b2ff-4e65-bcaf-874d44ad25fb	3b806a9a-5568-422a-ab43-7422823d8545	winloss_ratio_maintain	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	1.50	\N	2025-10-27 15:45:29.959162
64fd8702-1c46-48bf-8adc-46cc50100e26	4bc0d720-f05f-4680-adb5-18c75a1dfc9e	streak_continuation	zhynx	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/0	\N	\N	\N	2025-10-27 15:45:30.336934
8332345d-9749-471a-bf9f-c72bfdcad675	06420e0d-fbc0-4bb2-a098-6ba52f7e2f65	profit_streak	Unknown	\N	\N	\N	\N	\N	4824.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:30.781185
f2930d5c-45bd-48fa-bc9a-98617d26fc8a	0da2d7fd-7f1c-45d4-9bc5-a954bff53a1b	rank_improvement	kitty	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:45:31.164216
a975c8e4-378e-4aab-9741-a74d5b018683	4e8f1a30-f3e6-4703-9913-7280c0c1ce64	winloss_ratio_maintain	N’o	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/6	\N	1.50	\N	2025-10-27 15:45:31.540811
c5535c49-962d-48b5-8cf3-8958b65d2240	7dbdddd8-b690-4775-8623-9ec4366dcb1e	sol_gain_threshold	M A M B A 🧲	\N	\N	\N	\N	\N	\N	+39.06	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:45:31.940329
98c7ad27-0f28-4d6e-99ef-021a6d28c109	ea5b3c8d-d507-4fb1-aeb0-19c80b15ff19	top_rank_maintain	Files	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:45:32.313174
3884385a-c0a7-4198-a4d4-c4e951d9bee1	077f86fc-5fcb-4349-acbb-214c33137826	streak_continuation	Jijo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19/8	\N	\N	\N	2025-10-27 15:45:32.68693
4353881e-5309-42fb-a6af-aceefa52466a	2e4d6be5-ba9b-46dd-99a2-0e678faa3d03	profit_streak	DJ.Σn	\N	\N	\N	\N	\N	5316.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:33.070873
f40543ef-36fd-4999-8d12-3d3b6acf209b	4854ed9d-0a30-4469-9f05-51396bca371b	rank_improvement	Cented	\N	\N	\N	11	\N	\N	\N	\N	\N	\N	\N	\N	6.00	\N	2025-10-27 15:45:33.444686
5f957b6c-7105-4627-adf4-476e52573d63	99a4b76d-8362-455f-90ce-a5ef4231c422	sol_gain_threshold	dv	\N	\N	\N	\N	\N	\N	+17.11	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:45:33.834624
d1c381b9-b00a-42b6-b149-05073fe55ffc	f32729b4-98e4-4ccf-a08d-614c2a7bbed2	top_rank_maintain	West	\N	\N	\N	6	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:45:34.242751
5d7e2d21-60d9-47a3-83bc-df33a2609d1a	20863086-4fa1-4a43-96bb-9f4e573d4f87	rank_flippening	Jidn	Publix	\N	\N	18	13	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:34.631044
589cd0fb-3cfc-4ad9-bd0c-d77765153192	9388839b-6fe0-49bb-a723-184b27ccd6ae	rank_flippening	Heyitsyolo	Pandora	\N	\N	19	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:35.063426
7eda14b4-9e52-43da-98f2-3fddc932e960	b00f590b-382b-4bf1-a626-0214ceb259f8	rank_flippening	Letterbomb	rayan	\N	\N	17	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:35.461478
1b99c45f-09e1-4fe5-917c-bd2a4a98d9d5	727c56a5-d8b7-4c9b-8d18-15a834db37a5	rank_flippening	Scharo	Gake	\N	\N	11	14	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:45:35.843448
a2cf2feb-a407-4cf6-a522-83fe704ac9c6	3f51f91a-ecc6-4991-a4b4-ae4caf00817f	winrate_flippening	Files	N’o	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/16	8/6	\N	\N	2025-10-27 15:51:12.975082
3f9dc9cc-e056-4ff8-86e4-63695d91b5cb	420c9b00-b036-4c45-a71b-3ca288650d36	usd_gain_flippening	Sheep	Heyitsyolo	\N	\N	\N	\N	\N	\N	\N	6279.0	2517.2	\N	\N	\N	\N	2025-10-27 15:51:13.370968
918a967b-2297-4609-a785-45b54f5eec77	3639dcda-5ba7-47b4-ad62-527bdc816c2f	streak_continuation	Cented	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/32	\N	\N	\N	2025-10-27 15:51:13.498702
fd90b7a0-8017-4c64-a749-c10b457b7094	47448151-1105-4ef8-8433-f52da3910612	profit_streak	dv	\N	\N	\N	\N	\N	3427.9	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:51:14.252882
ed28f714-c109-4f74-a198-fa3f7d952ee6	a2fbbf5c-bf66-469e-84ca-214943a4d95c	sol_gain_threshold	Inside Calls	\N	\N	\N	\N	\N	\N	+13.05	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:51:14.655397
3f46e3ea-16e9-4633-970a-47574951249a	d40fb95f-ec82-427e-878a-e6d73b1b5026	rank_improvement	Pandora	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	14.00	\N	2025-10-27 15:51:15.044356
ec6cb3bd-aa3f-4a6b-8eef-daa40dbba510	0d17aba5-f5fa-4fa7-8cf4-b225816e1ab0	top_rank_maintain	DJ.Σn	\N	\N	\N	8	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:51:15.42987
0606c240-f5cc-44f2-97c0-afe0a4a34cc4	b92a73ff-491d-48b2-9a88-02709db58989	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	\N	2.50	\N	2025-10-27 15:51:15.80865
e7286f1f-0c70-4a8d-b072-61da7881f513	6fb62d74-2b92-4f08-9228-9749e464c606	profit_streak	oscar	\N	\N	\N	\N	\N	1999.8	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:51:16.18029
0d8e1433-07de-4ebb-a0b9-048eeb355bb9	1cb19948-8ddd-4551-9cfe-81bb572feb71	sol_gain_threshold	Kadenox	\N	\N	\N	\N	\N	\N	+18.24	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:51:16.555161
28e8ddbd-692a-4e38-8028-36cb158ac7c6	6158177d-d0ad-4a0f-a09b-d6b7ae3a6666	streak_continuation	Letterbomb	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14/30	\N	\N	\N	2025-10-27 15:51:16.931891
390c3a49-c636-47b2-a882-b1bf9808ff34	60aaf234-6ed2-431b-b938-f654c7b041fc	rank_improvement	kitty	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	17.00	\N	2025-10-27 15:51:17.318131
40cc1f9b-8900-424d-9c5a-11e32a5b79b0	f5c3dbb2-c96b-4265-bc10-6083ee61b1ff	top_rank_maintain	Jijo	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:51:17.711726
9fe8c4b0-e8ec-4f21-8ffe-977af4f295c1	0305f998-46be-45d8-9623-622e40ef2ff2	winloss_ratio_maintain	Ban	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/5	\N	1.50	\N	2025-10-27 15:51:18.112544
106e29c1-bd18-4acd-aefc-99f1d052ab20	a068d392-5a27-4c18-ba6b-8ca5fcb7e21a	streak_continuation	Unknown	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10/3	\N	\N	\N	2025-10-27 15:51:18.492711
9d8881f7-e2ba-4c89-8eb2-629217fce515	892fd414-86ab-4af8-900d-a61bfa53938c	rank_improvement	Jidn	\N	\N	\N	18	\N	\N	\N	\N	\N	\N	\N	\N	13.00	\N	2025-10-27 15:51:18.885985
0f9d82ef-5b04-48ac-a1b9-24d01c674b0c	656f3ce6-2bd1-4f3e-8aba-7873a5bab512	top_rank_maintain	M A M B A 🧲	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:51:19.260309
106e6f46-dc87-479c-a7ad-0f05080c1716	17bcecad-2eed-4ace-9be9-fef9e38fe1a0	sol_gain_threshold	BIGWARZ	\N	\N	\N	\N	\N	\N	+12.52	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:51:19.630839
ad759650-0666-4264-8060-4e24c98a49d2	a611ed97-7f61-4ce2-893d-7777c3b3de56	profit_streak	Gake	\N	\N	\N	\N	\N	3649.3	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:51:19.998588
9b69ef9b-030d-4768-b212-02d5e1284406	97bbc3c9-54a0-450e-bdae-5ebf6b5a133e	winloss_ratio_maintain	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/12	\N	2.50	\N	2025-10-27 15:51:20.371868
68eb2880-eb45-40f8-9065-ecc7e1e504bf	79609706-aad9-4171-8c47-5790c5194b4e	rank_improvement	zhynx	\N	\N	\N	12	\N	\N	\N	\N	\N	\N	\N	\N	9.00	\N	2025-10-27 15:51:20.745626
c055112c-b2b3-4997-9fb1-7dab0c5cb0ba	f9fa1bd6-ecb7-46d6-8423-d59a32b8d4dc	profit_streak	Publix	\N	\N	\N	\N	\N	2899.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:51:21.116631
c055d1b3-ff20-420c-8d43-a99f4b34b09f	4fdca4e7-4d55-4f18-bdc2-cecf94a2d596	streak_continuation	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7/5	\N	\N	\N	2025-10-27 15:51:21.48962
cdeaf28d-9b7f-4e87-868e-7091a5863b38	2ba47f06-9d64-4ddf-a393-0aa3fbf66b11	sol_gain_threshold	slingoor.usduc	\N	\N	\N	\N	\N	\N	+16.72	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:51:21.860748
40253925-8a67-4927-959e-029b2a10faea	971aef6b-fa83-41bb-9e4b-da90573b2f22	top_rank_maintain	West	\N	\N	\N	6	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:51:22.229097
d01bf3e3-0c4d-43cc-8063-d6b3e3c40522	dd5bff09-1d37-4f09-9768-22c2c6936972	rank_flippening	rayan	Scharo	\N	\N	19	11	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:51:22.604513
281b491e-f894-4196-b064-457cc0c322f7	25568022-301e-4a98-9613-0398716730d3	sol_gain_flippening	dv	Publix	\N	\N	\N	\N	\N	+17.11	+14.17	\N	\N	\N	\N	\N	\N	2025-10-27 15:54:57.401404
002f87a7-b1e0-41da-9930-c2cb330046ba	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	sol_gain_flippening	iconXBT	Scharo	\N	\N	\N	\N	\N	+18.36	+15.43	\N	\N	\N	\N	\N	\N	2025-10-27 15:54:57.77968
792d98f6-4c48-4689-bdec-5d128bf651b8	9c44dac0-5fd1-4bcc-97a8-437de0566b99	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	\N	2.50	\N	2025-10-27 15:54:57.871777
bd6edc13-fceb-4d29-bb89-2ac970013be5	0ef898c4-7377-437e-bd3b-0b5cbf753a20	sol_gain_threshold	West	\N	\N	\N	\N	\N	\N	+30.91	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:54:58.309711
17fb80fd-3b8a-48c5-9754-2a4c125b936f	e1867cc1-83cf-4a2c-81f2-6876e871b8b0	rank_improvement	kitty	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	15.00	\N	2025-10-27 15:54:58.691277
a2e7ef45-e2da-460a-9451-86223fb98845	0267bb9d-6e06-49fa-9635-ed713d6f66c9	streak_continuation	Files	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/16	\N	\N	\N	2025-10-27 15:54:59.108505
41cfc1d5-e307-4a68-821a-68189084b058	dbd13ea8-7c8f-41d6-9081-dcc74eeb3281	profit_streak	Unknown	\N	\N	\N	\N	\N	4824.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:54:59.503606
0c3aca33-35f0-41e5-9a64-b920801af584	7b58c03c-b8f1-4e9e-950e-6e44ef6dcf63	top_rank_maintain	M A M B A 🧲	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:54:59.897244
1f6ca859-5e0e-4804-bf42-b3b68cef0b29	7a17d590-8a99-46a2-a1b4-5c0c09a8e5cf	profit_streak	zhynx	\N	\N	\N	\N	\N	3716.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:00.276637
3a8b35be-3428-44b6-9217-60a363c5ff62	d048438d-2103-43ef-a637-dd175a507a61	top_rank_maintain	Jijo	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:00.655225
feef5b77-52b6-41b3-a1c2-55539528d1ca	03cc8282-43e1-4206-b1cf-4f0945276f3f	rank_improvement	Kadenox	\N	\N	\N	13	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:01.026176
efd70213-65aa-4bfb-b242-67da063471da	cd36ab8e-bf8d-4b6d-9dbb-badedec57555	sol_gain_threshold	big bags bobby	\N	\N	\N	\N	\N	\N	+38.28	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:01.39862
40c1fa65-0a9f-4895-b5d7-b0d513866358	74dfff1c-a85e-48dd-98d6-7186087b922e	streak_continuation	DJ.Σn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	53/3	\N	\N	\N	2025-10-27 15:55:01.769606
4c34755e-66eb-494a-8f70-f9a371aa2f01	40bbea08-4ca7-4140-a2d9-64582825bccb	winloss_ratio_maintain	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	1.50	\N	2025-10-27 15:55:02.201457
f7645495-73a0-4e7b-a42f-7f830b683190	c41da3c6-936e-4166-85a3-e6d12ebe2985	profit_streak	Heyitsyolo	\N	\N	\N	\N	\N	2517.2	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:02.646135
cb4a5131-bf08-4a27-b190-65dcb9860cdc	29e52b65-390f-47d6-8a82-2f85b69f21ed	rank_improvement	rayan	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	16.00	\N	2025-10-27 15:55:03.107396
fb0b2234-cfac-4bf2-bad3-89e19ceb032d	1e2677dd-4764-452c-937c-d963839d5d91	streak_continuation	Cented	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/32	\N	\N	\N	2025-10-27 15:55:03.634295
b371c6bf-a8e4-49e5-b529-364bbde33023	66629d3a-d741-4cdd-8f88-174479178066	rank_flippening	rayan	Trenchman	\N	\N	19	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:03.887585
49b0569b-9baa-4529-8c87-eaf69143ccec	628b3346-b3be-41cc-afed-73898030e2f2	sol_gain_threshold	Trenchman	\N	\N	\N	\N	\N	\N	+11.31	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:04.021039
c0fbfa6f-b8a3-4704-9940-1ac208e8f325	1d6dd619-56df-4aa2-ae9f-14e7bf131271	winrate_flippening	Cented	DJ.Σn	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/32	53/3	\N	\N	2025-10-27 15:55:04.259328
6b53fc34-ae80-4185-b536-a736d2ab9edd	0913581e-564b-43d5-82e4-7df06673254f	sol_gain_threshold	Scharo	\N	\N	\N	\N	\N	\N	+15.43	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:04.328081
3466b390-af9f-461f-9f40-26bcf0d35b4e	2f4c25c2-66a5-4ab6-9de7-daeda3ede298	top_rank_maintain	Sheep	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:04.397606
cf13bdf7-d8c6-423b-94b7-3c249c7508d5	11e1fe6c-07dc-4463-a338-de6f7bab83aa	rank_improvement	BIGWARZ	\N	\N	\N	15	\N	\N	\N	\N	\N	\N	\N	\N	5.00	\N	2025-10-27 15:55:04.702541
b81fa090-d404-46cf-8417-7bd8d39089d5	b316d3d4-bd81-40cf-8db5-b8015bc28a5e	winloss_ratio_maintain	slingoor.usduc	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/1	\N	1.50	\N	2025-10-27 15:55:04.774248
375d54b3-272a-4b28-b7ef-4a7f3ab351f6	320a12eb-977b-4144-96ab-1818e747949d	profit_streak	Letterbomb	\N	\N	\N	\N	\N	2611.5	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:05.073964
646f61ad-1e73-4d94-9f84-ef8ca5aa2e87	1266e4cc-51bc-4a6e-b408-e0e8a2a3c2fc	rank_improvement	N’o	\N	\N	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	6.00	\N	2025-10-27 15:55:05.139412
80e42412-1383-41f4-8c9f-f42a020d1338	f06f535b-b5d8-480f-922d-e0284dae7fdf	top_rank_maintain	Sheep	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:05.438219
5a35ef6a-6433-476b-a03b-66fe77477fed	9d748420-4dab-4ff0-b564-3036c44c3cfe	sol_gain_threshold	Jidn	\N	\N	\N	\N	\N	\N	+12.85	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:05.507528
ffea42a1-e888-40ef-b915-273cb671e013	fde4dfbd-94ff-4b1b-8021-ceb8a459d9c5	streak_continuation	Files	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/16	\N	\N	\N	2025-10-27 15:55:05.806897
bdbf89cf-d7d6-45ef-adb9-2a10284004aa	8d3fce19-7ae4-439f-b3cf-08573000fd42	profit_streak	Gake	\N	\N	\N	\N	\N	3649.3	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:05.88516
7f78889b-2e5f-47d4-b312-575d2496274a	eb044582-22ea-45bf-8f8b-173d7a1f6a8f	winloss_ratio_maintain	N’o	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/6	\N	1.50	\N	2025-10-27 15:55:06.17774
935adcfe-5ac8-4a5d-9143-8fa057cdcbd9	99022ed6-a01d-42fe-ac0b-3b870c966373	winloss_ratio_maintain	Ban	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/5	\N	1.50	\N	2025-10-27 15:55:06.626786
d871dce5-f1f5-405b-930f-0f90fac97d6f	b025c92b-bd50-440f-bc40-35ac37dd1c3f	rank_improvement	dv	\N	\N	\N	15	\N	\N	\N	\N	\N	\N	\N	\N	5.00	\N	2025-10-27 15:55:06.963269
a95a2132-84b6-4404-88e3-2c03990e244e	90f4960d-edd8-4c34-b354-ab2a451ca153	streak_continuation	oscar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16/21	\N	\N	\N	2025-10-27 15:55:06.26075
d75f13c8-b55f-4fe6-bb9b-65cda291f9ea	fbe5f1b8-da61-47ee-85ed-2aac30538ab5	profit_streak	Jidn	\N	\N	\N	\N	\N	2575.1	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:06.589777
a404bd97-4b02-4488-bf41-edc11e31fc5b	943faa17-c3aa-43bc-8de1-2b1d605dab24	rank_flippening	Pandora	BIGWARZ	\N	\N	19	15	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:07.002814
2ab935ce-e4cf-4423-920f-c5e8e0aa7982	b94a216a-d009-4b1a-b971-18849e5beff6	streak_continuation	M A M B A 🧲	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	713/42	\N	\N	\N	2025-10-27 15:55:07.342247
25349649-b457-4ab5-aa26-2976aadcf8ef	a844eed8-ac67-48b4-92ef-d2d7c81819c0	winloss_ratio_maintain	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7/5	\N	1.50	\N	2025-10-27 15:55:07.725203
56feaddd-2f35-4761-b98c-d1bf56c647f7	5713e604-41ac-4b36-8f01-76aa5d406c4d	sol_gain_threshold	Gake	\N	\N	\N	\N	\N	\N	+18.22	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:08.1083
3dcf0053-6647-4813-9e11-8314dc1422d6	47fb2476-df46-40cf-afa4-bd6b38767b53	top_rank_maintain	Unknown	\N	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:08.499891
bf10909e-b9a9-4b9c-886d-42a7b8298c6c	377ccb4b-8d59-4001-b7af-44ee119cad2b	sol_gain_threshold	Publix	\N	\N	\N	\N	\N	\N	+14.17	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:08.901032
3baa787b-0cb6-49e0-8e70-05552053ea7a	ea466b10-7998-433b-8a14-88ae1d2e16e6	profit_streak	zhynx	\N	\N	\N	\N	\N	3716.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:09.280365
f4cca6f3-7b6a-47b8-9330-fa18dca4b1bd	d11210a6-85d9-40a0-8618-c7b63a865d71	streak_continuation	Kadenox	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20/32	\N	\N	\N	2025-10-27 15:55:09.655275
502c93ea-f91f-432c-b12c-583cd164521a	4b658249-fb94-43be-9ce9-1f1c4dc706a8	rank_improvement	West	\N	\N	\N	6	\N	\N	\N	\N	\N	\N	\N	\N	1.00	\N	2025-10-27 15:55:10.027345
ff0eda1f-33cf-440c-a234-b41716545e59	6d0503ce-7038-4933-b8a1-4e45b1536a7d	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	249/88	\N	2.50	\N	2025-10-27 15:55:10.407329
f2e304fe-bc92-4f84-9609-c5d2f92fb427	96d9313f-5c98-4bcf-9e4e-788f679eb3c8	top_rank_maintain	Jijo	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-27 15:55:10.786365
9155646d-60e9-4f0a-9d67-e2d525e75073	f6502f65-a0cb-4368-be63-81784216293e	sol_gain_threshold	Ban	\N	\N	\N	\N	\N	\N	+30.76	\N	\N	\N	\N	\N	50.00	\N	2025-10-27 15:55:11.177633
517292d0-00bf-4948-a553-a9915e867f86	b7df6410-5bca-4750-a349-ae5d63bff3ce	rank_improvement	slingoor.usduc	\N	\N	\N	16	\N	\N	\N	\N	\N	\N	\N	\N	11.00	\N	2025-10-27 15:55:11.579432
e193a3e5-5161-47a6-9ca9-737ed83924e8	416020ce-6a06-4692-957d-f6a248411911	profit_streak	kitty	\N	\N	\N	\N	\N	2465.5	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:11.958032
ff04806d-2400-415b-9d12-a736cc1218c5	e0c63687-7fdb-4f10-b12d-858f10d8f1d5	streak_continuation	Heyitsyolo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27/32	\N	\N	\N	2025-10-27 15:55:12.33458
1ba21981-c5d7-4884-ad9a-6d95adef76df	3916455c-6663-4450-8a9a-333465aa3e8b	winloss_ratio_maintain	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34/12	\N	2.50	\N	2025-10-27 15:55:12.725788
f6286101-e081-4293-a6ab-39d53c88fe0a	19985202-24fc-4df6-84c8-660030f11f01	rank_flippening	oscar	Pandora	\N	\N	18	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:55:13.112945
bd466219-30b4-4937-979d-992565129a6b	fc84dd9d-8c8e-40ed-8a52-046304199c4b	winrate_flippening	Letterbomb	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	18/32	39/15	\N	\N	2025-10-28 03:00:00.606339
32b28787-1fad-4585-9613-637933f9db7b	c539c1de-b148-4484-b511-c0ffd4dbdee2	rank_flippening	N’o	Inside Calls	\N	\N	9	14	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:00.94017
c961d354-0ddf-4c88-94bc-e95601411ff4	949c1f6f-87b9-4f7c-a35f-60dcb0dfa3bd	profit_streak	Kev	\N	\N	\N	\N	\N	1662.7	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:00.960576
08f6cfc3-f7e7-4db5-9d3f-2f4149fec790	cc89af51-0a65-4a68-ae78-476cbfff3031	streak_continuation	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/8	\N	\N	\N	2025-10-28 03:00:01.278178
04d5ef31-2a33-4783-bc6e-e41e009c72ce	34598253-3bfc-4dba-9f59-51f56ff33234	top_rank_maintain	West	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 03:00:01.598969
a9e821d9-66cb-4877-ab48-d82b9cd3e9c8	ebbeaee4-c592-463c-a89f-3afec154f2cb	rank_improvement	Scharo	\N	\N	\N	11	\N	\N	\N	\N	\N	\N	\N	\N	8.00	\N	2025-10-28 03:00:01.917882
5478cebe-e3f4-4370-8002-6ff664be6f25	79135664-f287-4684-8b66-4641a93cb1c1	winloss_ratio_maintain	Jidn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/4	\N	1.50	\N	2025-10-28 03:00:02.236333
02e56b71-a1a8-441a-9a86-5aad023b747f	ba64ad83-cce5-435c-8844-4c6d1b7599d4	sol_gain_threshold	Publix	\N	\N	\N	\N	\N	\N	+14.17	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 03:00:02.554875
8b30cdc2-3280-4b30-87f6-3de619bdfba9	917a43b6-d78e-4a11-90af-9dad04fbf689	top_rank_maintain	Jijo	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 03:00:02.873707
0f9e96ef-01f0-45a5-8925-25d19c4ae8db	67fc7ee1-b9a3-42e5-94dd-cd025c64353d	streak_continuation	aloh	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	30/65	\N	\N	\N	2025-10-28 03:00:03.190301
0698e8e6-b00b-4876-95db-8ff350999775	ee90b393-a575-4b3d-9e28-cdc22c64ff14	rank_improvement	Heyitsyolo	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	9.00	\N	2025-10-28 03:00:03.505786
3926bcd3-9aaf-49a7-8f7e-893c72b586fa	a1af1189-8536-4970-a3ac-0a7eb191d9ca	profit_streak	Pandora	\N	\N	\N	\N	\N	1928.1	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:03.821806
0f475bfe-5fe0-4c55-86fa-71f2b311489c	a2fe981e-da92-4326-a45b-e8e7d121caee	sol_gain_threshold	gr3g	\N	\N	\N	\N	\N	\N	+112.47	\N	\N	\N	\N	\N	250.00	\N	2025-10-28 03:00:04.138208
b5a48719-dd7b-4f9e-8bf2-83780158c125	5e712dd7-58ee-43d2-9c71-a6e9a7a86021	winloss_ratio_maintain	Cooker	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13/5	\N	2.50	\N	2025-10-28 03:00:04.453683
d431966f-839c-43a0-bb8e-937c945b4ebe	326c5beb-a0e5-432d-9ce1-60cc09faef39	top_rank_maintain	M A M B A 🧲	\N	\N	\N	7	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 03:00:04.770421
9cc3a863-e5f1-4205-b325-bb9854be3fca	55c7c00b-2801-4dc0-b2e2-9c2cdafab625	sol_gain_threshold	Files	\N	\N	\N	\N	\N	\N	+33.79	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 03:00:05.085411
d92027e6-ac96-4f5a-8b4a-3b18ecf5686c	4059724b-5b60-4275-8cde-05e942af4c14	profit_streak	Gake	\N	\N	\N	\N	\N	3649.3	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:05.40204
791d903e-f4de-411c-b88f-5014c64c93a4	cade8bf2-4ca0-44fa-83e6-917d79dad532	streak_continuation	Kadenox	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20/32	\N	\N	\N	2025-10-28 03:00:05.71805
3a16f84b-2022-4520-a82b-6fa657e0258e	fda429cd-a69f-4a83-b3f7-02592b9bd6de	rank_improvement	Unknown	\N	\N	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	6.00	\N	2025-10-28 03:00:06.035722
245225b4-1960-44a0-a558-2cf409d59b39	7c2f61ed-92ad-455a-a8ba-3b0da2af4f07	winloss_ratio_maintain	slingoor.usduc	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/1	\N	2.00	\N	2025-10-28 03:00:06.352289
5975c9f5-ea1b-42f8-b938-00ddd8639bf9	9c3cbcb0-4552-428f-9ab5-48a55d4c31b5	sol_gain_threshold	kitty	\N	\N	\N	\N	\N	\N	+12.31	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 03:00:06.667859
430aeeca-46c9-4164-8ca7-03d5ae3450e7	7df61569-5f88-4991-8a8c-5b588d0cc3d7	rank_improvement	radiance	\N	\N	\N	11	\N	\N	\N	\N	\N	\N	\N	\N	1.00	\N	2025-10-28 03:00:06.983382
55a2482f-4ae2-47cc-b087-052c370b587c	fcb660d3-57de-430b-9495-3b56f8dd8dda	top_rank_maintain	Danny	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 03:00:07.300655
d7946af1-422a-4c61-b311-20510ad1bb93	413cfc23-c7c2-413e-a4ac-74008d77d70e	streak_continuation	Sheep	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17731/27	\N	\N	\N	2025-10-28 03:00:07.622198
4045546a-7468-49a2-9649-5c66e5480784	2384c16d-86fc-43eb-89ec-69296d305fae	profit_streak	rayan	\N	\N	\N	\N	\N	9674.9	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:07.940283
9e615840-ffa2-4d2e-ae32-50a7c05f3fa8	b375f605-1082-4bf1-b85c-173e1dd05697	rank_flippening	Beaver	Cented	\N	\N	8	18	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:08.256313
b5fed8f2-60e6-4bbd-a43b-e8078ca7a6c8	70000e3c-29fb-420a-aab3-9fb15d2b3bd3	rank_flippening	zhynx	Ban	\N	\N	12	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:08.575328
8522c2f3-e7a8-4829-addf-d125badfed56	f6c20dd6-940d-4e59-9632-341650a6f2d5	rank_flippening	dv	Trenchman	\N	\N	15	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:08.890527
10090ebb-20e4-4d78-ad8c-2869f69a4b33	b676be62-7c7c-4d2a-b7e1-a1bcca47f9f3	rank_flippening	oscar	Pain	\N	\N	18	17	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:09.206123
333702a0-cd44-47a2-87fb-a806f82badda	d6a9e081-4773-4011-89f3-b3eb261555d8	rank_flippening	BIGWARZ	DJ.Σn	\N	\N	20	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 03:00:09.5196
e2d03987-189d-4219-b7ba-42a8f945fe24	621f98b0-89ea-49de-8d53-e80a7df36042	sol_gain_flippening	h14	Gake	\N	\N	\N	\N	\N	+30.34	+32.57	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:17.808492
861b4eea-a5cf-42ea-8418-6b44764dc974	9461bb3d-c43e-445d-b561-8e5a4a9cea87	winloss_ratio_flippening	Jeets	iconXBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	11/6	30/17	\N	\N	2025-10-28 23:16:18.134937
21f59523-b64e-42d7-b2f7-e1993b52f186	e3183a8b-006f-43f1-bce5-beecd73e4505	streak_continuation	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4/4	\N	\N	\N	2025-10-28 23:16:18.15245
a6edd67c-6c38-4468-8881-09258a7e48f6	41efe570-c5e6-4f03-a3a9-003e1c80db46	sol_gain_threshold	Scharo	\N	\N	\N	\N	\N	\N	+15.43	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 23:16:18.475256
ae269098-3cb2-46e2-bef5-e3feb1e64df3	de9f0b13-259c-495c-8497-072ec8d45331	profit_streak	Beaver	\N	\N	\N	\N	\N	3448.5	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:18.797943
bd123c94-0577-4677-a8e7-b2eff737ab0a	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	top_rank_maintain	Danny	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:19.117581
b509b96b-e7d3-412c-905d-a8f59bb7317d	2f04d2b4-a630-4e96-8015-c5022e6c1b48	winloss_ratio_maintain	Jijo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20/13	\N	1.50	\N	2025-10-28 23:16:19.43649
761a6620-648b-4d72-bb6a-78a179b57b29	d56f2224-6c29-4110-8330-33dec782a2e2	rank_improvement	slingoor.usduc	\N	\N	\N	16	\N	\N	\N	\N	\N	\N	\N	\N	11.00	\N	2025-10-28 23:16:19.754721
0345c6b2-04fb-4c04-bf3f-ffdf0383c447	e2b697e2-deda-4171-a6d9-0d1c66ba888f	sol_gain_threshold	gr3g	\N	\N	\N	\N	\N	\N	+80.49	\N	\N	\N	\N	\N	100.00	\N	2025-10-28 23:16:20.076026
a3e79fd7-dcf5-4c70-a28d-21403d4876d1	21649439-df19-49a7-bd15-18cb5f39aeb9	profit_streak	Letterbomb	\N	\N	\N	\N	\N	3929.6	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:20.395393
ef0588f8-b4ec-472c-a833-1f4e4d73b692	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	top_rank_maintain	WaiterG	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:20.712961
42d057b0-7cb2-44d7-b090-bd62d63c2984	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	rank_improvement	Pain	\N	\N	\N	17	\N	\N	\N	\N	\N	\N	\N	\N	14.00	\N	2025-10-28 23:16:21.034436
3a6f4594-73ed-4d2c-90dd-456ef0547d4a	af62438b-0dfd-4b7e-921a-c65249b9514b	streak_continuation	Heyitsyolo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27/32	\N	\N	\N	2025-10-28 23:16:21.352818
b698c9e2-5d65-492d-beb0-767de778e8cb	c05312e8-40bf-42a8-a95e-443f391f6045	winloss_ratio_maintain	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	1.50	\N	2025-10-28 23:16:21.67228
b4a49fa2-b2c5-4c69-863a-00e8f6edbe2e	d30c9b38-20d5-4921-9666-2efdd14c2a6a	sol_gain_threshold	Ban	\N	\N	\N	\N	\N	\N	+16.17	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 23:16:21.991237
29257537-184e-4506-9874-b9aa431d9562	5877484f-f8a2-41b8-8889-7bac69f1c993	profit_streak	ozark	\N	\N	\N	\N	\N	5264.1	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:22.310934
bdbe2546-e5d7-4e64-b1e1-da1b4f2f7a73	ce750e89-ae58-40aa-8b69-ef078c54aff4	rank_improvement	oscar	\N	\N	\N	18	\N	\N	\N	\N	\N	\N	\N	\N	13.00	\N	2025-10-28 23:16:22.630292
493a7721-6859-4aa9-b31b-6df819e1ae56	d5812241-a74a-4d80-81d3-eab0c8af3b5b	top_rank_maintain	Unknown	\N	\N	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:22.948717
a4da9e27-66e3-46ae-b3c0-290f115bbfd3	ad076954-b6fe-487f-aa79-8c2cbfdb62e4	streak_continuation	aloh	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	30/65	\N	\N	\N	2025-10-28 23:16:23.267381
33234420-1974-4215-91e0-fa2f3257c027	76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	winloss_ratio_maintain	Jidn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/4	\N	1.75	\N	2025-10-28 23:16:23.587251
cbfde208-f2b9-40b4-a5a1-65ef4d8aa885	d34373d6-1998-4d30-ad8b-86693941de64	streak_continuation	Little Mustacho 🐕	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3/4	\N	\N	\N	2025-10-28 23:16:23.90696
4f6d9cd5-37b0-4363-8be6-0d15289d844e	34c43b93-174a-4546-9ad6-97bde99d37dc	top_rank_maintain	M A M B A 🧲	\N	\N	\N	7	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:24.226965
a5e0a190-a466-4468-9248-7d7387e223c1	6018a059-bdde-4605-8636-8c8ab7fadd6e	rank_improvement	Kadenox	\N	\N	\N	18	\N	\N	\N	\N	\N	\N	\N	\N	13.00	\N	2025-10-28 23:16:24.548763
180d285a-6c01-495f-949e-c67868c438b8	5ad16a19-1481-47b8-a791-69b314373c90	profit_streak	dv	\N	\N	\N	\N	\N	3427.9	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:24.869675
a4d62672-fa3d-4f44-a1ce-a2a076260a3f	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	sol_gain_threshold	Cooker	\N	\N	\N	\N	\N	\N	+18.60	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 23:16:25.191051
c2c977d2-6102-44d5-98d0-a84a17dbfc99	e2671622-4131-4733-8176-eb9c27780278	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	259/110	\N	2.00	\N	2025-10-28 23:16:25.510352
02a2565b-0c31-48d8-9478-fb61793795e2	ef4592dd-1cc6-4da6-80ad-c185d04b83e8	top_rank_maintain	West	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:25.829956
ff615bc7-c4e3-4004-893d-151d26428eb9	91c019e2-7233-495a-988a-8d4c7cdccd2b	profit_streak	Sheep	\N	\N	\N	\N	\N	2760.8	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:26.149674
def982be-fb4a-4906-9e24-dee130e48765	20250d49-1b4b-4096-a17c-6a6de8e21747	streak_continuation	lucas	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3/0	\N	\N	\N	2025-10-28 23:16:26.470592
d62080f2-573c-4660-9be1-86b56b0c084f	36d4b50a-987e-4b93-864b-aca00db121f7	rank_improvement	BIGWARZ	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-28 23:16:26.790412
1182f1c2-238a-4c3c-8583-18912ec1e7ac	696b7e3f-44bb-408f-b490-482f4fb7bcc2	sol_gain_threshold	Trenchman	\N	\N	\N	\N	\N	\N	+11.31	\N	\N	\N	\N	\N	50.00	\N	2025-10-28 23:16:27.109111
e33922d5-23bb-4575-874b-6f4c064a504d	ae59057f-cbc0-4ee4-b623-257f78296ba4	rank_flippening	rayan	Pandora	\N	\N	6	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:27.428946
e311cbb2-ea29-4a38-a31e-f7662af1ceef	d827611b-bd78-4f00-a05c-b68859aefca5	rank_flippening	Files	clukz	\N	\N	3	12	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:27.747941
8d58c092-c434-4968-90f2-ec5a6177fe10	5eb75da5-3e9c-4ddf-a60a-8960dccb0ea0	rank_flippening	zhynx	DJ.Σn	\N	\N	1	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:28.069042
357a8afc-6e7a-4498-bf1d-a03cda6497f2	c874aa81-c994-4238-bb51-1b6a3edbc40c	rank_flippening	radiance	Publix	\N	\N	17	13	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:28.387104
69e5006a-38d9-4587-a32f-011a8fd73e09	51fbe44c-ea10-43ad-ab46-37722bbe1409	rank_flippening	waste management	N’o	\N	\N	13	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:28.709344
741d04ed-82a1-4a17-90fd-62f16191e6bc	e6ce6e2c-77ed-4fd4-9687-23b604290619	rank_flippening	kitty	Cented	\N	\N	20	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-28 23:16:29.029582
4b311d5b-c71a-4007-9422-b3ece2749797	c4fadc68-4591-44c1-ae46-2b92182aaad6	winrate_flippening	rayan	zhynx	\N	\N	\N	\N	\N	\N	\N	\N	\N	9/10	5/0	\N	\N	2025-10-29 03:00:00.185387
eeee5106-50d7-4d3e-8f41-d3a886ed43a3	6ad998bf-c856-4322-b735-037e8904d055	winloss_ratio_flippening	ozark	Jidn	\N	\N	\N	\N	\N	\N	\N	\N	\N	556/10	6/4	\N	\N	2025-10-29 03:00:00.528722
d7d49a4b-5864-4cad-9770-fc6834f6bf8a	5fe1c164-bb06-4fa8-8ad3-a06abc6abb15	sol_gain_threshold	Rev	\N	\N	\N	\N	\N	\N	+12.99	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:00.556584
7ee639df-b46d-4e38-a8d3-95fb73151e35	1c586da6-67a5-4fde-bd90-c91e90daf7f9	profit_streak	iconXBT	\N	\N	\N	\N	\N	6721.1	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:00.886289
149a0db7-2a03-466c-8b5c-bc5f3176e5f4	309c1d8d-9977-4581-ba55-edd92c290a02	streak_continuation	Heyitsyolo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27/32	\N	\N	\N	2025-10-29 03:00:01.208506
19b8acee-d4ab-45af-9095-4bcfca5ff86c	063bc602-3bdb-433a-99fc-48cd7907b585	rank_improvement	Trenchman	\N	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:01.530829
5dc697c9-5d99-4816-ab8e-524208f542c9	ec85d862-f940-4da4-9d71-ef91ac09766b	top_rank_maintain	West	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:01.849321
e5238f1f-a2e1-4c9e-8756-70d5f89a3efa	c91aa145-33ce-48f4-ad33-9291b0934eb3	winloss_ratio_maintain	Jijo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20/13	\N	1.75	\N	2025-10-29 03:00:02.171216
da08270e-34b1-4c60-9785-6fca3157b1b6	c28ccf07-9769-4f65-8a48-3e151084ac97	rank_improvement	blixze ♱	\N	\N	\N	15	\N	\N	\N	\N	\N	\N	\N	\N	5.00	\N	2025-10-29 03:00:02.496481
1bb50763-a661-47f2-b4ae-c82146253c66	4f0fc05e-cc93-4d5a-94da-1715d59bf30f	sol_gain_threshold	Ethan Prosper	\N	\N	\N	\N	\N	\N	+12.18	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:02.814032
4c6794a4-94d3-43e1-9fcb-b58f89489465	25cc1c7c-5cfd-4b90-8937-22c9b8aaf35e	streak_continuation	gr3g	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	93/3	\N	\N	\N	2025-10-29 03:00:03.131842
561b17f4-5337-4a67-87a1-5f34124e70d5	d3e89df9-9022-45f0-9fba-73818181fa53	profit_streak	aloh	\N	\N	\N	\N	\N	11198.4	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:03.452047
1d35087e-a1d1-422a-87bc-f04fb3bd2b91	df2d34f2-e289-4b5c-b4ea-1d2bf3baa7ea	top_rank_maintain	Files	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:03.773457
432929fb-a87b-475d-a52a-6f6639125bdc	4ab9f9b5-6220-4ee6-945f-f642d78c1021	winloss_ratio_maintain	big bags bobby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6/3	\N	2.00	\N	2025-10-29 03:00:04.094441
90781d54-e7d2-4aad-8bc0-fc8345bcd227	e6fb2eb4-3deb-4629-b866-fe113219dd32	streak_continuation	h14	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8/32	\N	\N	\N	2025-10-29 03:00:04.414555
64f6c18a-d886-4aab-912f-8c1c53cb72cb	a107783f-e6f7-4653-bc4e-e80e6d298cfa	sol_gain_threshold	radiance	\N	\N	\N	\N	\N	\N	+17.05	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:04.731353
efe824ae-0fa6-474b-862e-45d0b03298fb	91c2d4d9-196d-4df5-acc9-944adc7d0b87	profit_streak	BIGWARZ	\N	\N	\N	\N	\N	3236.9	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:05.049745
a68689cf-e806-4281-bd5f-3f61f1b562a2	3aa29dfe-c815-4f42-9ebb-fc4bb3d496a6	top_rank_maintain	slingoor.usduc	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:05.366867
82c1f817-1dcc-4b3f-b025-67399a115b7d	60dfe25a-ed36-4b2e-a51e-be83a5b99e7c	winloss_ratio_maintain	jester	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2/1	\N	1.75	\N	2025-10-29 03:00:05.689039
be2fc70a-f8be-458f-95f7-0c2446dc6621	1dbc0ce9-9248-4334-8fd6-6821e13a5a8d	rank_improvement	para	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	14.00	\N	2025-10-29 03:00:06.015445
65dd08cf-eb3d-44bd-a5a9-fab6d91b2139	b2ff3162-4651-4d28-8f34-6b20cc8edf56	sol_gain_threshold	Jeets	\N	\N	\N	\N	\N	\N	+19.34	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:06.334607
33c9fa94-55ae-4f75-8fba-28140d7ccf7d	6a8cc070-067b-4c6d-8835-d33e45e31402	streak_continuation	Gake	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11/0	\N	\N	\N	2025-10-29 03:00:06.653276
2dc5b5e9-cfe4-4a4a-a936-1fa11189bf6b	6d608860-accc-4265-af48-9ee29017d4d2	top_rank_maintain	Unknown	\N	\N	\N	9	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:06.980741
6c8ae059-1d0e-4f53-bc42-aba40b8ace7d	96bad048-5b86-4576-b393-efe880fda961	profit_streak	clukz	\N	\N	\N	\N	\N	4141.8	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:07.296929
516dbdbc-e41e-4c30-b3f5-d81b405e80f3	a5f1b619-890d-414e-9ceb-e2bd4246aeda	winloss_ratio_maintain	Cooker	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13/5	\N	2.50	\N	2025-10-29 03:00:07.614513
fc37f55c-2ee9-4ebd-9e0f-5c94f1f5837e	4fc6ca97-b059-4a12-bef5-62686601221e	rank_improvement	Scharo	\N	\N	\N	11	\N	\N	\N	\N	\N	\N	\N	\N	1.00	\N	2025-10-29 03:00:07.933415
86236134-b9db-446a-b92c-d175ff9d5218	e3884b53-a8be-4fcd-9a70-34b4554b54cc	profit_streak	WaiterG	\N	\N	\N	\N	\N	16616.3	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:08.256958
7cb6027b-41e5-49ef-942f-b1ee86631692	d29e0e33-e8b9-4620-b35d-54e3beff7cca	rank_improvement	Pain	\N	\N	\N	17	\N	\N	\N	\N	\N	\N	\N	\N	14.00	\N	2025-10-29 03:00:08.577862
9a97d962-dc7f-4e0c-ac70-802efd953083	4a9038dd-3399-49d8-9670-2ef425d434cc	streak_continuation	Inside Calls	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5/4	\N	\N	\N	2025-10-29 03:00:08.896413
52849ce4-1ba6-4d3f-a5a4-c28b18536b0c	7865a002-88d2-4036-95b8-543dc3e51676	sol_gain_threshold	Kadenox	\N	\N	\N	\N	\N	\N	+14.99	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:09.211862
54764c35-3683-4bb3-a040-116863f16a90	636fa872-ac41-4f62-986c-ae6f03e65be0	top_rank_maintain	waste management	\N	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:09.530624
e97e8678-6587-4bb8-be73-ef8c13fd4b10	493ac96b-d610-4e01-8aa4-9074b1c3149f	winloss_ratio_maintain	Kev	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	243/82	\N	2.50	\N	2025-10-29 03:00:09.852894
78d9d4c8-b56d-4dbd-a0bf-fc8bd3daa257	1bd088b0-4fb0-4ebc-ad43-368df3c8b354	sol_gain_threshold	lucas	\N	\N	\N	\N	\N	\N	+18.94	\N	\N	\N	\N	\N	50.00	\N	2025-10-29 03:00:10.174227
a5dea670-a663-4a7b-8115-5fe483471e90	bc2a547b-ed40-48ad-b565-3043c4f883c0	rank_improvement	Pandora	\N	\N	\N	19	\N	\N	\N	\N	\N	\N	\N	\N	14.00	\N	2025-10-29 03:00:10.49238
9d7c0fb2-a453-4421-8929-49f81092bbbe	e6298676-26a1-4903-8775-9006aea4ea8b	streak_continuation	Beaver	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16/55	\N	\N	\N	2025-10-29 03:00:10.810321
47fd236c-d13a-4ded-90a1-78496eb1c2ac	21a270ff-00ae-493a-876d-1f43ad2a7056	profit_streak	Cented	\N	\N	\N	\N	\N	2838.4	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:11.127038
3bdf5e7f-06f1-4e1e-9a96-7356af9740ae	78e03e8c-fd59-4507-8ff7-03d6f47e3a72	top_rank_maintain	Danny	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	2025-10-29 03:00:11.443278
6992a6f1-01d7-40b3-944e-419c2b63a1ab	4e94ac6f-e124-4a7a-b061-9949d8d55545	rank_flippening	Letterbomb	mog	\N	\N	14	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:11.762916
155109fc-a44b-48f8-9cc4-7bfa19c543cb	21e73362-e364-4519-b292-a8f242ed54ca	rank_flippening	N’o	dv	\N	\N	11	15	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:12.082645
d61450ea-200b-419d-8629-c32bfe26f4a7	e2bba550-fe26-412d-8cbe-fdb6dc1e8ac3	rank_flippening	oscar	Little Mustacho 🐕	\N	\N	18	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:12.398824
cb788f90-fd06-4677-8ae4-11dd46f85cea	d600c750-f09c-4664-aa25-b324e74f26fb	rank_flippening	Veloce	kitty	\N	\N	14	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:12.716205
c5173983-7ee4-4e07-9d54-06ffa616a7f6	2de774f9-648d-4b44-a0fe-72e6850fb653	rank_flippening	M A M B A 🧲	Publix	\N	\N	7	13	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:13.039004
339552b6-9b0e-495b-94ed-2a64872d3d7f	5f832d26-3f40-4b1f-a806-c72ef9032d2b	rank_flippening	Sheep	Ban	\N	\N	12	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-29 03:00:13.357539
\.


--
-- Data for Name: markets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.markets (id, kol_id, title, description, outcome, yes_pool, no_pool, yes_price, no_price, yes_share_pool, yes_collateral_pool, no_share_pool, no_collateral_pool, current_yes_price, current_no_price, total_volume, is_live, resolved, resolved_value, resolves_at, created_at, engagement, market_type, market_category, requires_x_api) FROM stdin;
a346ae47-a04a-41db-8b03-f67977c0001b	df99abe0-2800-4600-901b-e78c125107e1	Will reach 150K followers by end of month?	Prediction market for Sarah Chen's performance metrics	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	966.35	f	t	no	2025-11-03 00:02:20.908	2025-10-27 00:02:20.951323	2.20	standard	general	f
1ce4d252-635e-4d74-a1cd-d97decd27ade	dcca0736-8e02-444c-83a5-348271d7bb1b	Will gain 10K+ followers in next 7 days?	Prediction market for Jordan Lee's performance metrics	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	189.37	f	t	no	2025-11-03 00:02:20.956	2025-10-27 00:02:20.997751	2.87	standard	general	f
73b48b00-1595-4877-a7bb-e893415b89f3	38de6f69-7a16-4cbb-b8ba-f213f63fc65e	Next campaign will get 50K+ interactions?	Prediction market for Taylor Swift's performance metrics	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	4322.95	f	t	yes	2025-11-03 00:02:20.979	2025-10-27 00:02:21.021228	0.57	standard	general	f
c9b0f1ce-9b2f-4bb6-b333-e2b5311a638f	ad3886f9-7faf-433d-ae54-8fa0b6036f8f	Will trending rate stay above 10%?	Prediction market for Chris Evans's performance metrics	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	4062.68	f	t	yes	2025-11-03 00:02:21.003	2025-10-27 00:02:21.044278	2.17	standard	general	f
de21bc29-26a9-46a7-ade4-63b0ac44f4a6	0edd9091-a9fc-4bb4-8336-34182dc1c784	Will collaborate with major brand this month?	Prediction market for Emma Watson's performance metrics	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	844.17	f	t	yes	2025-11-03 00:02:21.025	2025-10-27 00:02:21.066666	1.35	standard	general	f
73209b09-1398-4562-a07b-dbdfdd7d1ec8	d64b5f01-b88a-4718-be6f-5d478bc95f1e	Engagement rate will exceed 5% this week?	Prediction market for Alex Morgan's performance metrics	pending	10000.00	10000.00	0.5012	0.4988	19951.12	19951.12	20049.00	20049.00	0.5012	0.4988	992.60	f	t	no	2025-11-03 00:02:20.933	2025-10-27 00:02:20.975245	0.70	standard	general	f
aaed634d-fae7-41aa-8047-47e2969fa8a9	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo to gain +45 SOL	Will Jijo (jijo) achieve a total SOL gain of +45 or more by the end of the week?	Total SOL gain reaches +45 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.288	2025-10-27 01:45:11.309489	0.00	kolscan	general	f
6a7118f1-b0da-42b3-aa11-38b7971c203e	de488477-23b8-484d-90fa-59e29f4e26c5	M A M B A 🧲 to gain +45 SOL	Will M A M B A 🧲 (mamba🧲) achieve a total SOL gain of +45 or more by the end of the week?	Total SOL gain reaches +45 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.309	2025-10-27 01:45:11.331378	0.00	kolscan	general	f
d8b6a2a0-ca89-48d0-a705-e9f351a4bd5e	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Cented to gain +40 SOL	Will Cented (cented) achieve a total SOL gain of +40 or more by the end of the week?	Total SOL gain reaches +40 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.33	2025-10-27 01:45:11.353208	0.00	kolscan	general	f
ba95b89b-3945-4319-b262-dabd7bf26147	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	N’o to gain +30 SOL	Will N’o (n’o) achieve a total SOL gain of +30 or more by the end of the week?	Total SOL gain reaches +30 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.353	2025-10-27 01:45:11.37531	0.00	kolscan	general	f
3b3b3156-af3b-476b-b9a1-109867d86b0f	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	DJ.Σn to gain +25 SOL	Will DJ.Σn (dj.σn) achieve a total SOL gain of +25 or more by the end of the week?	Total SOL gain reaches +25 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.374	2025-10-27 01:45:11.396091	0.00	kolscan	general	f
fe03bbd7-b200-43f1-941c-46b73e2db112	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +25 SOL	Will Files (files) achieve a total SOL gain of +25 or more by the end of the week?	Total SOL gain reaches +25 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.395	2025-10-27 01:45:11.417561	0.00	kolscan	general	f
6eb2858b-159a-4741-8774-30a0ce08042c	613a324c-091b-4948-a69b-5144b04bb933	West to gain +25 SOL	Will West (west) achieve a total SOL gain of +25 or more by the end of the week?	Total SOL gain reaches +25 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.417	2025-10-27 01:45:11.439379	0.00	kolscan	general	f
e2a9f9f0-b2a3-4b87-87c2-9fdce9174bb0	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Kadenox to gain +25 SOL	Will Kadenox (kadenox) achieve a total SOL gain of +25 or more by the end of the week?	Total SOL gain reaches +25 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.438	2025-10-27 01:45:11.460242	0.00	kolscan	general	f
1f88de8d-a5d7-4c7b-aaf3-296c065a1168	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	iconXBT to gain +20 SOL	Will iconXBT (iconxbt) achieve a total SOL gain of +20 or more by the end of the week?	Total SOL gain reaches +20 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.459	2025-10-27 01:45:11.482119	0.00	kolscan	general	f
5e10eee5-51e0-4889-a422-83678b5aebcd	502a8fee-21f9-42eb-8784-9c4b55ea4f30	zhynx to gain +20 SOL	Will zhynx (zhynx) achieve a total SOL gain of +20 or more by the end of the week?	Total SOL gain reaches +20 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.481	2025-10-27 01:45:11.503619	0.00	kolscan	general	f
4be74820-c3b4-4ef8-8765-0bb93bee8608	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Scharo to gain +20 SOL	Will Scharo (scharo) achieve a total SOL gain of +20 or more by the end of the week?	Total SOL gain reaches +20 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.503	2025-10-27 01:45:11.525743	0.00	kolscan	general	f
cfcabc91-832e-4912-a70f-7ce0fb9e61c4	5d15d55f-1f0e-4757-b774-cb24606f1757	kitty to gain +15 SOL	Will kitty (kitty) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.524	2025-10-27 01:45:11.547055	0.00	kolscan	general	f
0b78b9cb-185e-4b64-b52b-146bfee1b948	f3c9a444-0ead-4253-901a-69517f1d4a28	Publix to gain +15 SOL	Will Publix (publix) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.548	2025-10-27 01:45:11.570877	0.00	kolscan	general	f
d5ac2ff3-a61c-446c-bcd0-6861caa063f0	6225736b-d70a-4635-a9e2-83fd3d045ffe	Inside Calls to gain +15 SOL	Will Inside Calls (insidecalls) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.57	2025-10-27 01:45:11.592224	0.00	kolscan	general	f
f72f5b46-64f9-4260-9efc-456d6df19eb2	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Sheep to gain +15 SOL	Will Sheep (sheep) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.591	2025-10-27 01:45:11.613938	0.00	kolscan	general	f
e2a1532a-ef7d-4242-9a0d-6ed8ada8c780	9a76d553-5287-4006-8315-a03392ced768	dv to gain +15 SOL	Will dv (dv) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.612	2025-10-27 01:45:11.633462	0.00	kolscan	general	f
938a66d0-fd65-4eb8-999c-ec351aad1fdb	00a0edb8-f329-458e-9ead-36904162e7da	oscar to gain +15 SOL	Will oscar (oscar) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.633	2025-10-27 01:45:11.655479	0.00	kolscan	general	f
a8582bd5-0245-4b45-b96b-768d314c7996	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Pandora to gain +15 SOL	Will Pandora (pandora) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.654	2025-10-27 01:45:11.675819	0.00	kolscan	general	f
632e0d2f-6261-4a90-8518-662c4c269a37	48fd5bc9-7b30-41e8-a7c5-98387139c979	Gake to gain +15 SOL	Will Gake (gake) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.675	2025-10-27 01:45:11.697072	0.00	kolscan	general	f
43276e0d-4395-43c2-ad02-377f8c687b1d	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Kev to gain +15 SOL	Will Kev (kev) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:45:11.696	2025-10-27 01:45:11.718489	0.00	kolscan	general	f
dea8c9e9-5145-440b-898f-d61f8691c241	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo to gain +50 SOL	Will Jijo (jijo) achieve a total SOL gain of +50 or more by the end of the week?	Total SOL gain reaches +50 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:49:49.605	2025-10-27 01:49:49.62706	0.00	kolscan	general	f
141a60bb-1047-458a-a246-bd11d6ab5314	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +30 SOL	Will Files (files) achieve a total SOL gain of +30 or more by the end of the week?	Total SOL gain reaches +30 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:49:49.627	2025-10-27 01:49:49.651296	0.00	kolscan	general	f
48dd6df1-6ede-4159-8e6b-bfe1991ca64c	c47d2e86-6f9c-4fe3-b718-715da4f65586	big bags bobby to gain +15 SOL	Will big bags bobby (bigbagsbobby) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:49:49.652	2025-10-27 01:49:49.673411	0.00	kolscan	general	f
0b363732-4886-4836-a59a-ed72ddfae55f	de488477-23b8-484d-90fa-59e29f4e26c5	M A M B A 🧲 to gain +40 SOL	Will M A M B A 🧲 (mamba🧲) achieve a total SOL gain of +40 or more by the end of the week?	Total SOL gain reaches +40 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:58:58.785	2025-10-27 01:58:58.803999	0.00	kolscan	general	f
4e909982-c748-43ac-b53b-3c25d6f9182b	f0d37280-6d2b-4568-bf83-64be010be717	BIGWARZ to gain +15 SOL	Will BIGWARZ (bigwarz) achieve a total SOL gain of +15 or more by the end of the week?	Total SOL gain reaches +15 or higher	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-11-03 02:58:58.809	2025-10-27 01:58:58.827293	0.00	kolscan	general	f
8358d7f8-6a96-4c46-94dd-09a8e97a148a	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo to gain +1000 SOL	Will Jijo (jijo) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 03:03:54.003	2025-10-27 02:03:54.020737	0.00	kolscan	general	f
5f3f6f8f-f473-4cfc-8ab1-c47752ab27e7	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +35 SOL	Will Files (files) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 03:03:54.026	2025-10-27 02:03:54.043551	0.00	kolscan	general	f
f4679f4d-b013-436d-a685-e8805ada431d	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo to gain +1000 SOL	Will Jijo (jijo) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 03:05:07.952	2025-10-27 02:05:07.969632	0.00	kolscan	general	f
cd48e4e9-a2c1-4c48-81e4-bf683e6a3875	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +35 SOL	Will Files (files) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 03:05:07.976	2025-10-27 02:05:07.992801	0.00	kolscan	general	f
feabb979-da3f-4539-84d6-690103c48653	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx rank higher than Kadenox on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of zhynx (currently #9) vs Kadenox (currently #7)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:47.037	2025-10-27 02:05:47.053623	0.00	rank_flippening	ranking	f
58cec4b3-acd8-4b70-8927-ccb3a4f10853	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Kev's profitability streak. Currently: 1662.7	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:47.481	2025-10-27 02:05:47.497759	0.00	profit_streak	performance	f
456738cb-8f52-48d8-b9e6-7e4858d1b78a	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep gain +50 SOL or more by tomorrow?	Sheep currently has +11.20 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:47.85	2025-10-27 02:05:47.870933	0.00	sol_gain_threshold	performance	f
7133d2f0-ec8c-4d98-89e6-80066f67e843	9a76d553-5287-4006-8315-a03392ced768	Will dv reach rank #6 or better by tomorrow?	dv is currently #16. Can they climb to #6 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:48.228	2025-10-27 02:05:48.244078	0.00	rank_improvement	ranking	f
1bc15a56-4869-4ec9-9bad-9c3f58b0f9cb	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Inside Calls's profitability streak. Currently: 2671.2	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:50.451	2025-10-27 02:05:50.467448	0.00	profit_streak	performance	f
b209641d-7db6-4c37-86e9-c2f3c6372747	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar record a win on tomorrow's leaderboard?	oscar has 16 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:48.595	2025-10-27 02:05:48.611598	0.00	streak_continuation	performance	f
5adddbff-eed3-40b2-b1f2-0c148645df59	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented maintain a top 10 rank on tomorrow's leaderboard?	Cented is currently #3. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:48.968	2025-10-27 02:05:48.984965	0.00	top_rank_maintain	ranking	f
81293c70-4c55-4226-8265-94bb83ee21c4	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	iconXBT currently has a 2.83 W/L ratio (34/12). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:49.341	2025-10-27 02:05:49.357891	0.00	winloss_ratio_maintain	performance	f
50d39c4f-c935-4376-a1b6-608e8a179305	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #2 or better by tomorrow?	kitty is currently #12. Can they climb to #2 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:50.818	2025-10-27 02:05:50.83456	0.00	rank_improvement	ranking	f
d89930a8-c382-4344-8e95-3a6940e9e50b	28045aed-c22a-400a-af25-af765f640bb8	Will Files record a win on tomorrow's leaderboard?	Files has 3 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:49.709	2025-10-27 02:05:49.726034	0.00	streak_continuation	performance	f
fde9d18f-74e4-4ee6-9ea4-daa3029c3a9b	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn gain +50 SOL or more by tomorrow?	DJ.Σn currently has +24.74 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:50.082	2025-10-27 02:05:50.099457	0.00	sol_gain_threshold	performance	f
4e84b9ad-cbec-4176-9419-6b78361620aa	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a top 10 rank on tomorrow's leaderboard?	Jijo is currently #1. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:51.188	2025-10-27 02:05:51.20452	0.00	top_rank_maintain	ranking	f
5ee05adf-f78b-4f62-9fed-45c290c8d1da	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	big bags bobby currently has a 1.67 W/L ratio (5/3). Can they stay above 1.75?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:51.553	2025-10-27 02:05:51.570075	0.00	winloss_ratio_maintain	performance	f
4324e0fa-14ec-4390-8fb3-6e01299da9d1	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o have a positive USD Gain on tomorrow's leaderboard?	Prediction market for N’o's profitability streak. Currently: 5371.6	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:51.925	2025-10-27 02:05:51.941792	0.00	profit_streak	performance	f
2c0c1f90-211d-4ab7-bd4a-d1135d1637b7	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ reach rank #5 or better by tomorrow?	BIGWARZ is currently #15. Can they climb to #5 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:52.293	2025-10-27 02:05:52.309719	0.00	rank_improvement	ranking	f
cf8cc358-d50b-4fe2-aeb6-623aa44bbdc4	613a324c-091b-4948-a69b-5144b04bb933	Will West gain +50 SOL or more by tomorrow?	West currently has +22.58 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:52.657	2025-10-27 02:05:52.674326	0.00	sol_gain_threshold	performance	f
a967c1ec-cb76-4f0e-a4be-ea5017db573d	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo record a win on tomorrow's leaderboard?	Scharo has 31 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:53.029	2025-10-27 02:05:53.045852	0.00	streak_continuation	performance	f
d78618ae-3daf-4ec6-98c9-46c38dc247ea	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #2. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 02:05:53.397	2025-10-27 02:05:53.413407	0.00	top_rank_maintain	ranking	f
c9eb1e87-a44c-484f-8e64-8aadee6c06bf	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora have higher SOL gains than Gake on tomorrow's leaderboard?	SOL gain comparison: +9.42 vs +8.61	pending	10000.00	10000.00	0.5227	0.4773	19110.42	19110.42	20931.00	20931.00	0.5227	0.4773	950.00	f	t	no	2025-10-28 02:05:47.411	2025-10-27 02:05:47.427602	0.00	sol_gain_flippening	performance	f
37b861df-7fba-4a34-a46d-d957b704f158	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix have higher SOL gains than Sheep on tomorrow's leaderboard?	SOL gain comparison: +14.17 vs +11.20	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10901.02	20000.00	9098.98	0.5451	0.4549	0.00	f	t	cancelled	2025-10-28 02:25:46.255	2025-10-27 02:25:46.357587	0.00	sol_gain_flippening	performance	f
d8c15dc6-f31b-4cde-8593-fc5a5d092544	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Scharo's profitability streak. Currently: 3157.3	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 02:25:46.778	2025-10-27 02:25:46.805509	0.00	profit_streak	performance	f
45477e01-386d-413f-b0f7-e6fbb8dd029f	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox gain +50 SOL or more by tomorrow?	Kadenox currently has +24.02 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9764.80	20000.00	10235.20	0.4882	0.5118	0.00	f	t	cancelled	2025-10-28 02:25:47.523	2025-10-27 02:25:47.554198	0.00	sol_gain_threshold	performance	f
4c7b463b-ba58-4582-bab5-5a00b1e864f6	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby reach rank #9 or better by tomorrow?	big bags bobby is currently #19. Can they climb to #9 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	yes	2025-10-28 02:25:47.899	2025-10-27 02:25:47.925854	0.00	rank_improvement	ranking	f
2c86c4a0-064b-4e5b-bc50-ef02875f55ce	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	iconXBT currently has a 2.83 W/L ratio (34/12). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11333.33	20000.00	8666.67	0.5667	0.4333	0.00	f	t	cancelled	2025-10-28 02:25:48.269	2025-10-27 02:25:48.29624	0.00	winloss_ratio_maintain	performance	f
89a98418-2a3f-46a7-b955-eb531e5bada9	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #8. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13200.00	20000.00	6800.00	0.6600	0.3400	0.00	f	t	cancelled	2025-10-28 02:25:48.634	2025-10-27 02:25:48.660827	0.00	top_rank_maintain	ranking	f
ecb9de96-1831-4216-92ea-db33c97ec879	28045aed-c22a-400a-af25-af765f640bb8	Will Files record a win on tomorrow's leaderboard?	Files has 3 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 02:25:47.149	2025-10-27 02:25:47.174974	0.00	streak_continuation	performance	f
5a961b9b-4511-43e3-89ea-b256af754d26	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev have a higher win/loss ratio than Inside Calls on tomorrow's leaderboard?	Win/Loss ratio comparison: Kev has 2.83 (249/88) vs Inside Calls with 1.25 (5/4)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11865.77	20000.00	8134.23	0.5933	0.4067	0.00	f	t	cancelled	2025-10-28 02:25:46.709	2025-10-27 02:25:46.735429	0.00	winloss_ratio_flippening	performance	f
960d3292-0d7e-4809-93d6-0416cd922712	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo gain +100 SOL or more by tomorrow?	Jijo currently has +50.20 SOL gain. Can they reach +100 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10024.00	20000.00	9976.00	0.5012	0.4988	0.00	f	t	cancelled	2025-10-28 02:25:49	2025-10-27 02:25:49.025251	0.00	sol_gain_threshold	performance	f
9d274565-4c16-432b-9347-f46cf7e164b6	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #7 or better by tomorrow?	kitty is currently #12. Can they climb to #7 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 02:25:49.366	2025-10-27 02:25:49.391834	0.00	rank_improvement	ranking	f
77cbff65-7b61-4c7a-ba9d-b8c733d83827	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar have a positive USD Gain on tomorrow's leaderboard?	Prediction market for oscar's profitability streak. Currently: 1999.8	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 02:25:49.73	2025-10-27 02:25:49.757104	0.00	profit_streak	performance	f
50b4cd9e-3b6d-4a0c-8fbf-eb22040801b0	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora record a win on tomorrow's leaderboard?	Pandora has 20 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 02:25:50.1	2025-10-27 02:25:50.126515	0.00	streak_continuation	performance	f
c1a1e06b-d9dc-4488-9896-4862d125be5e	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx maintain a top 10 rank on tomorrow's leaderboard?	zhynx is currently #9. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	12600.00	20000.00	7400.00	0.6300	0.3700	0.00	f	t	cancelled	2025-10-28 02:25:50.466	2025-10-27 02:25:50.493483	0.00	top_rank_maintain	ranking	f
c3a706e4-7bdd-4b01-823e-6c57f95f1657	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented rank higher than Gake on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Cented (currently #3) vs Gake (currently #19)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11600.00	20000.00	8400.00	0.5800	0.4200	0.00	f	t	cancelled	2025-10-28 02:25:50.837	2025-10-27 02:25:50.863163	0.00	rank_flippening	ranking	f
38dc4742-bc63-41a0-8a86-d871fce0684d	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o rank higher than DJ.Σn on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of N’o (currently #5) vs DJ.Σn (currently #6)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10100.00	20000.00	9900.00	0.5050	0.4950	0.00	f	t	cancelled	2025-10-28 02:25:51.202	2025-10-27 02:25:51.231271	0.00	rank_flippening	ranking	f
d0022d4b-77f3-4222-b8c4-665ea71301eb	9a76d553-5287-4006-8315-a03392ced768	Will dv rank higher than M A M B A 🧲 on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of dv (currently #16) vs M A M B A 🧲 (currently #2)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	8600.00	20000.00	11400.00	0.4300	0.5700	0.00	f	t	cancelled	2025-10-28 02:25:51.573	2025-10-27 02:25:51.598417	0.00	rank_flippening	ranking	f
fd348275-09eb-4fe6-8eae-3bec3c4b6f29	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx have a better win rate than kitty on tomorrow's leaderboard?	Win rate comparison: zhynx (2/0) vs kitty (1/0)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:37:19.747	2025-10-27 15:37:19.796934	0.00	winrate_flippening	performance	f
11ce2199-af30-401b-a2f8-8afc3aadcf3a	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo gain +100 SOL or more by tomorrow?	Jijo currently has +50.20 SOL gain. Can they reach +100 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10024.00	20000.00	9976.00	0.5012	0.4988	0.00	f	t	cancelled	2025-10-28 15:37:19.863	2025-10-27 15:37:19.917439	0.00	sol_gain_threshold	performance	f
dfb61d88-73eb-4b25-93b0-bc81a60c510f	9a76d553-5287-4006-8315-a03392ced768	Will dv reach rank #6 or better by tomorrow?	dv is currently #16. Can they climb to #6 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-28 15:37:20.275	2025-10-27 15:37:20.32316	0.00	rank_improvement	ranking	f
a439f241-92d3-44e7-b392-6d9d9cbc7e74	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #8. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13200.00	20000.00	6800.00	0.6600	0.3400	0.00	f	t	cancelled	2025-10-28 15:37:20.671	2025-10-27 15:37:20.71963	0.00	top_rank_maintain	ranking	f
b779a386-ce8e-4d5f-b846-4cbc667cce00	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT record a win on tomorrow's leaderboard?	iconXBT has 34 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:37:21.049	2025-10-27 15:37:21.097389	0.00	streak_continuation	performance	f
727e5c73-c2f1-4bcd-9425-53e3dde37f87	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Gake's profitability streak. Currently: 1760.4	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:37:21.442	2025-10-27 15:37:21.490164	0.00	profit_streak	performance	f
883272c7-f0a8-4e1c-9dd3-51643615c95c	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.83 W/L ratio (249/88). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11318.18	20000.00	8681.82	0.5659	0.4341	0.00	f	t	cancelled	2025-10-28 15:37:21.828	2025-10-27 15:37:21.876247	0.00	winloss_ratio_maintain	performance	f
3b4bfa63-f52b-4c91-b0c7-51ff378f9fde	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn reach rank #1 or better by tomorrow?	DJ.Σn is currently #6. Can they climb to #1 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:37:22.211	2025-10-27 15:37:22.259437	0.00	rank_improvement	ranking	f
ecf23f5a-aeb4-48f3-b34e-1d2d74ab0679	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls record a win on tomorrow's leaderboard?	Inside Calls has 5 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:37:22.591	2025-10-27 15:37:22.638724	0.00	streak_continuation	performance	f
39a67c6c-dfd9-41a5-af54-d0f76a3b1c4d	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora gain +50 SOL or more by tomorrow?	Pandora currently has +9.42 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6260.80	20000.00	13739.20	0.3130	0.6870	0.00	f	t	cancelled	2025-10-28 15:37:22.988	2025-10-27 15:37:23.036137	0.00	sol_gain_threshold	performance	f
e64f7355-2761-4e2a-a3c7-c5a57b67f16a	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Cented's profitability streak. Currently: 7379.7	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:37:23.411	2025-10-27 15:37:23.460169	0.00	profit_streak	performance	f
76f3559b-343e-41af-aa3e-e32f6a08137a	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep have higher USD gains than Files on tomorrow's leaderboard?	USD gain comparison: Sheep (2291.4) vs Files (6716.6)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6070.42	20000.00	13929.58	0.3035	0.6965	0.00	f	t	cancelled	2025-10-28 15:37:19.323	2025-10-27 15:37:19.371508	0.00	usd_gain_flippening	performance	f
7118ceb6-e108-4b45-9438-b684f2e0d12d	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o maintain a top 10 rank on tomorrow's leaderboard?	N’o is currently #5. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15000.00	20000.00	5000.00	0.7500	0.2500	0.00	f	t	cancelled	2025-10-28 15:37:23.822	2025-10-27 15:37:23.869601	0.00	top_rank_maintain	ranking	f
426c9981-2982-4fc6-b0b7-b236e6b3300c	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	big bags bobby currently has a 1.67 W/L ratio (5/3). Can they stay above 1.75?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9666.67	20000.00	10333.33	0.4833	0.5167	0.00	f	t	cancelled	2025-10-28 15:37:24.214	2025-10-27 15:37:24.26229	0.00	winloss_ratio_maintain	performance	f
b3dbb2cc-dedb-4d31-87d0-cd16e9e3265d	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ gain +50 SOL or more by tomorrow?	BIGWARZ currently has +12.52 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7004.80	20000.00	12995.20	0.3502	0.6498	0.00	f	t	cancelled	2025-10-28 15:37:24.593	2025-10-27 15:37:24.641378	0.00	sol_gain_threshold	performance	f
251f7f93-cfdf-4f0d-8eb6-e45be86c7a1e	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar have a positive USD Gain on tomorrow's leaderboard?	Prediction market for oscar's profitability streak. Currently: 1999.8	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:37:24.974	2025-10-27 15:37:25.025575	0.00	profit_streak	performance	f
17c99a79-7fec-4579-95d4-0e60403cc92d	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #2. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	16800.00	20000.00	3200.00	0.8400	0.1600	0.00	f	t	cancelled	2025-10-28 15:37:25.376	2025-10-27 15:37:25.426824	0.00	top_rank_maintain	ranking	f
5d180dfc-a5a8-4132-9919-522bd2eea739	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo record a win on tomorrow's leaderboard?	Scharo has 31 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:37:25.774	2025-10-27 15:37:25.825392	0.00	streak_continuation	performance	f
f045c092-2ad9-42bc-93ec-1bf321e1f3d3	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix reach rank #3 or better by tomorrow?	Publix is currently #13. Can they climb to #3 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-28 15:37:26.168	2025-10-27 15:37:26.218684	0.00	rank_improvement	ranking	f
53f68b5f-e9c9-4f87-9e4a-793be86cbadd	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +35 SOL	Will Files (files) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.661	2025-10-27 15:39:07.710083	0.00	kolscan	general	f
3b99f53f-f55e-4800-8610-41df0156f266	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Ban to gain +30 SOL	Will Ban (ban) achieve a total SOL gain of +30 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	yes	2025-11-03 16:39:07.683	2025-10-27 15:39:07.731174	0.00	kolscan	general	f
68aab555-d5ba-4bdd-a339-6704f635a1a9	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Unknown to gain +25 SOL	Will Unknown (unknown) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.706	2025-10-27 15:39:07.754636	0.00	kolscan	general	f
9dd9a467-2d82-4ea9-840b-6f48b6a3afbe	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	slingoor.usduc to gain +25 SOL	Will slingoor.usduc (slingoor.usduc) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.729	2025-10-27 15:39:07.777154	0.00	kolscan	general	f
0161d438-11cc-4ab5-958b-6a56b30bb03e	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Kadenox to gain +20 SOL	Will Kadenox (kadenox) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.75	2025-10-27 15:39:07.797579	0.00	kolscan	general	f
86aabc84-d2cf-4ec0-9094-87155e5c5b5f	02a20037-4254-40b0-8310-5d188c664fc9	Jidn to gain +15 SOL	Will Jidn (jidn) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.77	2025-10-27 15:39:07.818465	0.00	kolscan	general	f
dc6836b4-f99b-4f9c-a7c0-326cf007f2f7	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Heyitsyolo to gain +15 SOL	Will Heyitsyolo (heyitsyolo) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.791	2025-10-27 15:39:07.839902	0.00	kolscan	general	f
ce186ccf-f017-43bd-9a06-b1a072351555	d326149d-4af5-4621-bb59-f4df85ea7605	rayan to gain +15 SOL	Will rayan (rayan) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:07.813	2025-10-27 15:39:07.861584	0.00	kolscan	general	f
4f131d1d-2921-4773-b301-b7dbf9e2ba49	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Letterbomb to gain +15 SOL	Will Letterbomb (letterbomb) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:35.65	2025-10-27 15:39:35.698089	0.00	kolscan	general	f
d1474a43-2ce0-4cb8-8755-fceaef529a9a	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Trenchman to gain +15 SOL	Will Trenchman (trenchman) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:39:35.671	2025-10-27 15:39:35.720077	0.00	kolscan	general	f
b0804955-ebdc-4a9b-9f11-77f349f8c79e	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo have higher USD gains than Jijo on tomorrow's leaderboard?	USD gain comparison: Heyitsyolo (2517.7) vs Jijo (6699.3)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6370.93	20000.00	13629.07	0.3185	0.6815	0.00	f	t	cancelled	2025-10-28 15:41:18.763	2025-10-27 15:41:18.813375	0.00	usd_gain_flippening	performance	f
8e0bbe13-2111-4548-9133-c27a5831c9a5	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Kadenox's profitability streak. Currently: 3654.4	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:41:18.835	2025-10-27 15:41:18.88779	0.00	profit_streak	performance	f
30a23afb-0f6f-45f0-8872-d920c04eb2d7	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx gain +50 SOL or more by tomorrow?	zhynx currently has +18.55 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	8452.00	20000.00	11548.00	0.4226	0.5774	0.00	f	t	cancelled	2025-10-28 15:41:19.209	2025-10-27 15:41:19.259559	0.00	sol_gain_threshold	performance	f
6a421238-5aee-4467-b16e-2b0a2e158cbc	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 record a win on tomorrow's leaderboard?	M A M B A 🧲 has 713 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:41:19.602	2025-10-27 15:41:19.65348	0.00	streak_continuation	performance	f
b9b2ec8f-aaa2-4396-90ba-392019170e86	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban have higher SOL gains than Jidn on tomorrow's leaderboard?	SOL gain comparison: +30.88 vs +12.31	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13361.85	20000.00	6638.15	0.6681	0.3319	0.00	f	t	cancelled	2025-10-28 15:41:18.383	2025-10-27 15:41:18.435078	0.00	sol_gain_flippening	performance	f
70a7b8cd-8b3a-4308-bbf1-aa1942d5230f	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown reach rank #7 or better by tomorrow?	Unknown is currently #10. Can they climb to #7 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:41:19.994	2025-10-27 15:41:20.043996	0.00	rank_improvement	ranking	f
9bf46ebc-9f56-4600-b0db-99fb025da447	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep maintain a top 10 rank on tomorrow's leaderboard?	Sheep is currently #7. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13800.00	20000.00	6200.00	0.6900	0.3100	0.00	f	t	cancelled	2025-10-28 15:41:20.384	2025-10-27 15:41:20.434509	0.00	top_rank_maintain	ranking	f
14317835-9133-4f2d-b7fd-75eae67d10b7	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan have a positive USD Gain on tomorrow's leaderboard?	Prediction market for rayan's profitability streak. Currently: 2482.4	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:41:21.157	2025-10-27 15:41:21.214167	0.00	profit_streak	performance	f
ebd4e724-173a-4249-aa91-9bc509f349d4	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix gain +50 SOL or more by tomorrow?	Publix currently has +14.17 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7400.80	20000.00	12599.20	0.3700	0.6300	0.00	f	t	cancelled	2025-10-28 15:41:21.585	2025-10-27 15:41:21.636619	0.00	sol_gain_threshold	performance	f
dd11efbb-8b49-45ff-ac6d-dba4e4e124e8	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT reach rank #5 or better by tomorrow?	iconXBT is currently #10. Can they climb to #5 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:41:21.962	2025-10-27 15:41:22.022836	0.00	rank_improvement	ranking	f
990ccf04-677e-4c29-b523-cc723a054c24	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented record a win on tomorrow's leaderboard?	Cented has 35 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:41:22.346	2025-10-27 15:41:22.397173	0.00	streak_continuation	performance	f
e2c56d90-4caf-40fb-a6d6-608be9c982fa	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.83 W/L ratio (249/88). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11318.18	20000.00	8681.82	0.5659	0.4341	0.00	f	t	no	2025-10-28 15:41:22.725	2025-10-27 15:41:22.776135	0.00	winloss_ratio_maintain	performance	f
e3058e6f-3666-4a07-b2d9-39a2ce44617a	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn maintain a top 10 rank on tomorrow's leaderboard?	DJ.Σn is currently #8. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13200.00	20000.00	6800.00	0.6600	0.3400	0.00	f	t	no	2025-10-28 15:41:23.109	2025-10-27 15:41:23.159161	0.00	top_rank_maintain	ranking	f
9e59a9cf-ebf6-4f78-8b4f-a368105ba2b8	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Gake's profitability streak. Currently: 3987.6	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:41:23.479	2025-10-27 15:41:23.529987	0.00	profit_streak	performance	f
2cd3b9a6-a0af-4744-a90b-f135947d3574	28045aed-c22a-400a-af25-af765f640bb8	Will Files gain +50 SOL or more by tomorrow?	Files currently has +33.24 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11977.60	20000.00	8022.40	0.5989	0.4011	0.00	f	t	no	2025-10-28 15:41:23.849	2025-10-27 15:41:23.899289	0.00	sol_gain_threshold	performance	f
b61fff24-42a7-4c39-9096-1edbf5853a24	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #15 or better by tomorrow?	kitty is currently #20. Can they climb to #15 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:41:24.228	2025-10-27 15:41:24.283914	0.00	rank_improvement	ranking	f
a164989f-90de-41fa-80e1-616c6e83c50a	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Will Trenchman record a win on tomorrow's leaderboard?	Trenchman has 9 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:41:24.674	2025-10-27 15:41:24.73146	0.00	streak_continuation	performance	f
93ced1e3-7dcd-47e1-a054-2a6eef9fc4fa	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	N’o currently has a 1.33 W/L ratio (8/6). Can they stay above 1.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9333.33	20000.00	10666.67	0.4667	0.5333	0.00	f	t	no	2025-10-28 15:41:25.067	2025-10-27 15:41:25.121512	0.00	winloss_ratio_maintain	performance	f
1ce18c6f-8673-4f73-8a2d-5097f34fca38	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #5. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	15000.00	20000.00	5000.00	0.7500	0.2500	0.00	f	t	no	2025-10-28 15:41:25.462	2025-10-27 15:41:25.517284	0.00	top_rank_maintain	ranking	f
366dafe7-0cc6-489d-bab0-d19b1f2085fa	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb reach rank #16 or better by tomorrow?	Letterbomb is currently #19. Can they climb to #16 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:41:25.862	2025-10-27 15:41:25.913441	0.00	rank_improvement	ranking	f
fe31dcc2-ea50-440f-8532-a9078ca50701	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Pandora's profitability streak. Currently: 1928.1	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:41:26.238	2025-10-27 15:41:26.292356	0.00	profit_streak	performance	f
6d014d91-9120-43c7-8ffc-c63229aaad24	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	slingoor.usduc currently has a 2.00 W/L ratio (2/1). Can they stay above 1.75?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11000.00	20000.00	9000.00	0.5500	0.4500	0.00	f	t	yes	2025-10-28 15:41:26.618	2025-10-27 15:41:26.668902	0.00	winloss_ratio_maintain	performance	f
ea3997c0-de42-4653-a2b8-92f612812ad7	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby gain +50 SOL or more by tomorrow?	big bags bobby currently has +38.05 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13132.00	20000.00	6868.00	0.6566	0.3434	0.00	f	t	no	2025-10-28 15:41:27.04	2025-10-27 15:41:27.112114	0.00	sol_gain_threshold	performance	f
88832a98-4a9a-45ca-9e24-ffe9ce05ab12	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar record a win on tomorrow's leaderboard?	oscar has 16 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:41:27.452	2025-10-27 15:41:27.510726	0.00	streak_continuation	performance	f
99b71b74-2943-43ef-9305-002a3445403f	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo rank higher than dv on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Scharo (currently #11) vs dv (currently #15)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10400.00	20000.00	9600.00	0.5200	0.4800	0.00	f	t	no	2025-10-28 15:41:27.836	2025-10-27 15:41:27.886256	0.00	rank_flippening	ranking	f
a428625b-26ad-4f5a-89a3-f17662243bfb	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Inside Calls currently has a 1.25 W/L ratio (5/4). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9000.00	20000.00	11000.00	0.4500	0.5500	0.00	f	t	cancelled	2025-10-28 15:41:20.763	2025-10-27 15:41:20.813483	0.00	winloss_ratio_maintain	performance	f
df4dfb2f-5095-48e3-ba9f-a01d9ce90928	28045aed-c22a-400a-af25-af765f640bb8	Files to gain +35 SOL	Will Files (files) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.105	2025-10-27 15:43:41.158837	0.00	kolscan	general	f
bab3f144-e39b-477c-a702-7f2efad1249d	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Jijo to gain +35 SOL	Will Jijo (jijo) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.13	2025-10-27 15:43:41.183696	0.00	kolscan	general	f
2eadfef6-a23a-4e44-9c3d-d3dfc8f33cd8	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Sheep to gain +35 SOL	Will Sheep (sheep) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.16	2025-10-27 15:43:41.213108	0.00	kolscan	general	f
82489e42-96ad-4caf-8084-c1af768182c5	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Ban to gain +35 SOL	Will Ban (ban) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.185	2025-10-27 15:43:41.238085	0.00	kolscan	general	f
1e052adb-dd4b-4bc0-9e22-0fb5796b602a	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	DJ.Σn to gain +30 SOL	Will DJ.Σn (dj.σn) achieve a total SOL gain of +30 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.208	2025-10-27 15:43:41.261453	0.00	kolscan	general	f
a5482b73-5afc-4e7f-963e-8d7f6701e343	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Unknown to gain +25 SOL	Will Unknown (unknown) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.236	2025-10-27 15:43:41.289715	0.00	kolscan	general	f
97393619-a547-4076-9646-7d1dbf391252	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Cented to gain +20 SOL	Will Cented (cented) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.263	2025-10-27 15:43:41.315634	0.00	kolscan	general	f
a9339fc9-207b-4ec4-8257-d8e1015dcaf0	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Kadenox to gain +20 SOL	Will Kadenox (kadenox) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.288	2025-10-27 15:43:41.341189	0.00	kolscan	general	f
6063653e-7716-4b64-8251-03a890163a4f	48fd5bc9-7b30-41e8-a7c5-98387139c979	Gake to gain +20 SOL	Will Gake (gake) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.316	2025-10-27 15:43:41.370896	0.00	kolscan	general	f
968918ad-70ec-4724-bec3-9d99712c9d01	9a76d553-5287-4006-8315-a03392ced768	dv to gain +20 SOL	Will dv (dv) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.342	2025-10-27 15:43:41.394651	0.00	kolscan	general	f
bb701c8a-3358-48ef-b258-f7f6deb93704	02a20037-4254-40b0-8310-5d188c664fc9	Jidn to gain +15 SOL	Will Jidn (jidn) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.365	2025-10-27 15:43:41.417953	0.00	kolscan	general	f
11871da4-1c38-49f9-b081-41e9c839c0e3	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Heyitsyolo to gain +15 SOL	Will Heyitsyolo (heyitsyolo) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:43:41.388	2025-10-27 15:43:41.442009	0.00	kolscan	general	f
c34150c0-b4b2-4344-a8ad-113336df8c4f	613a324c-091b-4948-a69b-5144b04bb933	West to gain +35 SOL	Will West (west) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:44:21.744	2025-10-27 15:44:21.797902	0.00	kolscan	general	f
6c3364a3-36b0-4fef-97a9-9445880f34a5	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Trenchman to gain +15 SOL	Will Trenchman (trenchman) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-03 16:44:21.767	2025-10-27 15:44:21.820258	0.00	kolscan	general	f
9ede9f7a-a5e3-42de-8b4a-808b9f251e05	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc gain +50 SOL or more by tomorrow?	slingoor.usduc currently has +16.72 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8012.80	20000.00	11987.20	0.4006	0.5994	0.00	f	t	no	2025-10-28 15:45:27.993	2025-10-27 15:45:28.047124	0.00	sol_gain_threshold	performance	f
3395a3a6-746b-4e05-9342-7abd54234601	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Will Trenchman have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Trenchman's profitability streak. Currently: 2264.7	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:45:28.371	2025-10-27 15:45:28.426674	0.00	profit_streak	performance	f
5f475065-67df-48f7-9ff0-7c3e21a10e61	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev reach rank #15 or better by tomorrow?	Kev is currently #20. Can they climb to #15 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:45:28.75	2025-10-27 15:45:28.804318	0.00	rank_improvement	ranking	f
976ed7fb-ea95-4f1d-8252-4f5c492f3f4b	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar record a win on tomorrow's leaderboard?	oscar has 16 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:45:29.126	2025-10-27 15:45:29.180071	0.00	streak_continuation	performance	f
3b806a9a-5568-422a-ab43-7422823d8545	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Inside Calls currently has a 1.25 W/L ratio (5/4). Can they stay above 1.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9000.00	20000.00	11000.00	0.4500	0.5500	0.00	f	t	no	2025-10-28 15:45:29.881	2025-10-27 15:45:29.935466	0.00	winloss_ratio_maintain	performance	f
9eddb4ed-8e10-48e7-abf3-3621f24319bb	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep maintain a top 10 rank on tomorrow's leaderboard?	Sheep is currently #5. Can they stay in the top 10?	pending	10000.00	10000.00	0.5121	0.4879	19521.72	19521.72	20490.00	20490.00	0.5121	0.4879	500.00	f	t	no	2025-10-28 15:45:29.504	2025-10-27 15:45:29.558432	0.00	top_rank_maintain	ranking	f
4bc0d720-f05f-4680-adb5-18c75a1dfc9e	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx record a win on tomorrow's leaderboard?	zhynx has 2 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:45:30.252	2025-10-27 15:45:30.30683	0.00	streak_continuation	performance	f
5f065c8c-c8be-492a-a5ec-ae35c17ff042	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban have a better win rate than iconXBT on tomorrow's leaderboard?	Win rate comparison: Ban (6/5) vs iconXBT (34/12)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8063.24	20000.00	11936.76	0.4032	0.5968	0.00	f	t	no	2025-10-28 15:45:27.531	2025-10-27 15:45:27.584826	0.00	winrate_flippening	performance	f
98fe4f74-30a8-49ca-b082-0baac9132cc1	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby have a higher win/loss ratio than BIGWARZ on tomorrow's leaderboard?	Win/Loss ratio comparison: big bags bobby has 1.40 (7/5) vs BIGWARZ with 0.33 (1/3)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	12341.46	20000.00	7658.54	0.6171	0.3829	0.00	f	t	no	2025-10-28 15:45:27.903	2025-10-27 15:45:27.956852	0.00	winloss_ratio_flippening	performance	f
06420e0d-fbc0-4bb2-a098-6ba52f7e2f65	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Unknown's profitability streak. Currently: 4824.6	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:45:30.697	2025-10-27 15:45:30.755781	0.00	profit_streak	performance	f
0da2d7fd-7f1c-45d4-9bc5-a954bff53a1b	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #10 or better by tomorrow?	kitty is currently #20. Can they climb to #10 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-28 15:45:31.083	2025-10-27 15:45:31.138062	0.00	rank_improvement	ranking	f
4e8f1a30-f3e6-4703-9913-7280c0c1ce64	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	N’o currently has a 1.33 W/L ratio (8/6). Can they stay above 1.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9333.33	20000.00	10666.67	0.4667	0.5333	0.00	f	t	no	2025-10-28 15:45:31.46	2025-10-27 15:45:31.514883	0.00	winloss_ratio_maintain	performance	f
7dbdddd8-b690-4775-8623-9ec4366dcb1e	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 gain +50 SOL or more by tomorrow?	M A M B A 🧲 currently has +39.06 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13374.40	20000.00	6625.60	0.6687	0.3313	0.00	f	t	no	2025-10-28 15:45:31.855	2025-10-27 15:45:31.910144	0.00	sol_gain_threshold	performance	f
ea5b3c8d-d507-4fb1-aeb0-19c80b15ff19	28045aed-c22a-400a-af25-af765f640bb8	Will Files maintain a top 10 rank on tomorrow's leaderboard?	Files is currently #3. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	16200.00	20000.00	3800.00	0.8100	0.1900	0.00	f	t	no	2025-10-28 15:45:32.234	2025-10-27 15:45:32.289069	0.00	top_rank_maintain	ranking	f
077f86fc-5fcb-4349-acbb-214c33137826	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo record a win on tomorrow's leaderboard?	Jijo has 19 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:45:32.609	2025-10-27 15:45:32.663891	0.00	streak_continuation	performance	f
2e4d6be5-ba9b-46dd-99a2-0e678faa3d03	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn have a positive USD Gain on tomorrow's leaderboard?	Prediction market for DJ.Σn's profitability streak. Currently: 5316.6	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:45:32.985	2025-10-27 15:45:33.043862	0.00	profit_streak	performance	f
4854ed9d-0a30-4469-9f05-51396bca371b	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented reach rank #6 or better by tomorrow?	Cented is currently #11. Can they climb to #6 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:45:33.367	2025-10-27 15:45:33.421738	0.00	rank_improvement	ranking	f
99a4b76d-8362-455f-90ce-a5ef4231c422	9a76d553-5287-4006-8315-a03392ced768	Will dv gain +50 SOL or more by tomorrow?	dv currently has +17.11 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8106.40	20000.00	11893.60	0.4053	0.5947	0.00	f	t	no	2025-10-28 15:45:33.745	2025-10-27 15:45:33.799502	0.00	sol_gain_threshold	performance	f
f32729b4-98e4-4ccf-a08d-614c2a7bbed2	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #6. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	14400.00	20000.00	5600.00	0.7200	0.2800	0.00	f	t	no	2025-10-28 15:45:34.145	2025-10-27 15:45:34.204012	0.00	top_rank_maintain	ranking	f
20863086-4fa1-4a43-96bb-9f4e573d4f87	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn rank higher than Publix on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Jidn (currently #18) vs Publix (currently #13)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9500.00	20000.00	10500.00	0.4750	0.5250	0.00	f	t	no	2025-10-28 15:45:34.549	2025-10-27 15:45:34.605405	0.00	rank_flippening	ranking	f
9388839b-6fe0-49bb-a723-184b27ccd6ae	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo rank higher than Pandora on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Heyitsyolo (currently #19) vs Pandora (currently #19)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:45:34.967	2025-10-27 15:45:35.028189	0.00	rank_flippening	ranking	f
b00f590b-382b-4bf1-a626-0214ceb259f8	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb rank higher than rayan on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Letterbomb (currently #17) vs rayan (currently #19)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10200.00	20000.00	9800.00	0.5100	0.4900	0.00	f	t	no	2025-10-28 15:45:35.367	2025-10-27 15:45:35.42285	0.00	rank_flippening	ranking	f
727c56a5-d8b7-4c9b-8d18-15a834db37a5	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo rank higher than Gake on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Scharo (currently #11) vs Gake (currently #14)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10300.00	20000.00	9700.00	0.5150	0.4850	0.00	f	t	no	2025-10-28 15:45:35.763	2025-10-27 15:45:35.817275	0.00	rank_flippening	ranking	f
420c9b00-b036-4c45-a71b-3ca288650d36	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep have higher USD gains than Heyitsyolo on tomorrow's leaderboard?	USD gain comparison: Sheep (6279.0) vs Heyitsyolo (2517.2)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13420.91	20000.00	6579.09	0.6710	0.3290	0.00	f	t	no	2025-10-28 15:51:13.285	2025-10-27 15:51:13.343661	0.00	usd_gain_flippening	performance	f
3639dcda-5ba7-47b4-ad62-527bdc816c2f	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented record a win on tomorrow's leaderboard?	Cented has 34 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:51:13.393	2025-10-27 15:51:13.455473	0.00	streak_continuation	performance	f
47448151-1105-4ef8-8433-f52da3910612	9a76d553-5287-4006-8315-a03392ced768	Will dv have a positive USD Gain on tomorrow's leaderboard?	Prediction market for dv's profitability streak. Currently: 3427.9	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	yes	2025-10-28 15:51:14.135	2025-10-27 15:51:14.202878	0.00	profit_streak	performance	f
a2fbbf5c-bf66-469e-84ca-214943a4d95c	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls gain +50 SOL or more by tomorrow?	Inside Calls currently has +13.05 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	7132.00	20000.00	12868.00	0.3566	0.6434	0.00	f	t	no	2025-10-28 15:51:14.574	2025-10-27 15:51:14.63303	0.00	sol_gain_threshold	performance	f
d40fb95f-ec82-427e-878a-e6d73b1b5026	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora reach rank #14 or better by tomorrow?	Pandora is currently #19. Can they climb to #14 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:51:14.951	2025-10-27 15:51:15.010707	0.00	rank_improvement	ranking	f
0d17aba5-f5fa-4fa7-8cf4-b225816e1ab0	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn maintain a top 10 rank on tomorrow's leaderboard?	DJ.Σn is currently #8. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13200.00	20000.00	6800.00	0.6600	0.3400	0.00	f	t	no	2025-10-28 15:51:15.349	2025-10-27 15:51:15.408024	0.00	top_rank_maintain	ranking	f
b92a73ff-491d-48b2-9a88-02709db58989	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.83 W/L ratio (249/88). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11318.18	20000.00	8681.82	0.5659	0.4341	0.00	f	t	no	2025-10-28 15:51:15.723	2025-10-27 15:51:15.782938	0.00	winloss_ratio_maintain	performance	f
3f51f91a-ecc6-4991-a4b4-ae4caf00817f	28045aed-c22a-400a-af25-af765f640bb8	Will Files have a better win rate than N’o on tomorrow's leaderboard?	Win rate comparison: Files (8/16) vs N’o (8/6)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	7619.05	20000.00	12380.95	0.3810	0.6190	0.00	f	t	no	2025-10-28 15:51:12.882	2025-10-27 15:51:12.941071	0.00	winrate_flippening	performance	f
6fb62d74-2b92-4f08-9228-9749e464c606	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar have a positive USD Gain on tomorrow's leaderboard?	Prediction market for oscar's profitability streak. Currently: 1999.8	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:51:16.1	2025-10-27 15:51:16.15844	0.00	profit_streak	performance	f
892fd414-86ab-4af8-900d-a61bfa53938c	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn reach rank #13 or better by tomorrow?	Jidn is currently #18. Can they climb to #13 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:51:18.796	2025-10-27 15:51:18.85543	0.00	rank_improvement	ranking	f
1cb19948-8ddd-4551-9cfe-81bb572feb71	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox gain +50 SOL or more by tomorrow?	Kadenox currently has +18.24 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8377.60	20000.00	11622.40	0.4189	0.5811	0.00	f	t	no	2025-10-28 15:51:16.469	2025-10-27 15:51:16.528046	0.00	sol_gain_threshold	performance	f
6158177d-d0ad-4a0f-a09b-d6b7ae3a6666	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb record a win on tomorrow's leaderboard?	Letterbomb has 14 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:51:16.849	2025-10-27 15:51:16.908178	0.00	streak_continuation	performance	f
60aaf234-6ed2-431b-b938-f654c7b041fc	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #17 or better by tomorrow?	kitty is currently #20. Can they climb to #17 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:51:17.237	2025-10-27 15:51:17.295623	0.00	rank_improvement	ranking	f
f5c3dbb2-c96b-4265-bc10-6083ee61b1ff	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a top 10 rank on tomorrow's leaderboard?	Jijo is currently #4. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	15600.00	20000.00	4400.00	0.7800	0.2200	0.00	f	t	no	2025-10-28 15:51:17.613	2025-10-27 15:51:17.672013	0.00	top_rank_maintain	ranking	f
0305f998-46be-45d8-9623-622e40ef2ff2	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Ban currently has a 1.20 W/L ratio (6/5). Can they stay above 1.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8800.00	20000.00	11200.00	0.4400	0.5600	0.00	f	t	no	2025-10-28 15:51:18.017	2025-10-27 15:51:18.078619	0.00	winloss_ratio_maintain	performance	f
a068d392-5a27-4c18-ba6b-8ca5fcb7e21a	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown record a win on tomorrow's leaderboard?	Unknown has 10 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:51:18.41	2025-10-27 15:51:18.468484	0.00	streak_continuation	performance	f
a611ed97-7f61-4ce2-893d-7777c3b3de56	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Gake's profitability streak. Currently: 3649.3	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:51:19.919	2025-10-27 15:51:19.976797	0.00	profit_streak	performance	f
656f3ce6-2bd1-4f3e-8aba-7873a5bab512	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #1. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	17400.00	20000.00	2600.00	0.8700	0.1300	0.00	f	t	no	2025-10-28 15:51:19.182	2025-10-27 15:51:19.239728	0.00	top_rank_maintain	ranking	f
17bcecad-2eed-4ace-9be9-fef9e38fe1a0	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ gain +50 SOL or more by tomorrow?	BIGWARZ currently has +12.52 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	7004.80	20000.00	12995.20	0.3502	0.6498	0.00	f	t	no	2025-10-28 15:51:19.552	2025-10-27 15:51:19.610982	0.00	sol_gain_threshold	performance	f
f9fa1bd6-ecb7-46d6-8423-d59a32b8d4dc	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Publix's profitability streak. Currently: 2899.6	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	no	2025-10-28 15:51:21.037	2025-10-27 15:51:21.096334	0.00	profit_streak	performance	f
97bbc3c9-54a0-450e-bdae-5ebf6b5a133e	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	iconXBT currently has a 2.83 W/L ratio (34/12). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11333.33	20000.00	8666.67	0.5667	0.4333	0.00	f	t	no	2025-10-28 15:51:20.291	2025-10-27 15:51:20.351222	0.00	winloss_ratio_maintain	performance	f
79609706-aad9-4171-8c47-5790c5194b4e	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx reach rank #9 or better by tomorrow?	zhynx is currently #12. Can they climb to #9 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:51:20.663	2025-10-27 15:51:20.721393	0.00	rank_improvement	ranking	f
4fdca4e7-4d55-4f18-bdc2-cecf94a2d596	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby record a win on tomorrow's leaderboard?	big bags bobby has 7 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-10-28 15:51:21.407	2025-10-27 15:51:21.465676	0.00	streak_continuation	performance	f
2ba47f06-9d64-4ddf-a393-0aa3fbf66b11	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc gain +50 SOL or more by tomorrow?	slingoor.usduc currently has +16.72 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8012.80	20000.00	11987.20	0.4006	0.5994	0.00	f	t	no	2025-10-28 15:51:21.781	2025-10-27 15:51:21.839839	0.00	sol_gain_threshold	performance	f
971aef6b-fa83-41bb-9e4b-da90573b2f22	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #6. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	14400.00	20000.00	5600.00	0.7200	0.2800	0.00	f	t	no	2025-10-28 15:51:22.15	2025-10-27 15:51:22.207884	0.00	top_rank_maintain	ranking	f
25568022-301e-4a98-9613-0398716730d3	9a76d553-5287-4006-8315-a03392ced768	Will dv have higher SOL gains than Publix on tomorrow's leaderboard?	SOL gain comparison: +17.11 vs +14.17	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10728.62	20000.00	9271.38	0.5364	0.4636	0.00	f	t	cancelled	2025-10-28 15:54:57.309	2025-10-27 15:54:57.371238	0.00	sol_gain_flippening	performance	f
f934ac20-c4c3-4fb1-8c54-35ea539f7cad	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT have higher SOL gains than Scharo on tomorrow's leaderboard?	SOL gain comparison: +18.36 vs +15.43	cancelled	10000.00	10000.00	0.4512	0.5488	22058.00	22058.00	18134.02	18134.02	0.4512	0.5488	2100.00	f	t	cancelled	2025-10-28 15:54:57.694	2025-10-27 15:54:57.755966	0.00	sol_gain_flippening	performance	f
dd5bff09-1d37-4f09-9768-22c2c6936972	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan rank higher than Scharo on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of rayan (currently #19) vs Scharo (currently #11)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:51:22.517	2025-10-27 15:51:22.574057	0.00	rank_flippening	ranking	f
0ef898c4-7377-437e-bd3b-0b5cbf753a20	613a324c-091b-4948-a69b-5144b04bb933	Will West gain +50 SOL or more by tomorrow?	West currently has +30.91 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11418.40	20000.00	8581.60	0.5709	0.4291	0.00	f	t	cancelled	2025-10-28 15:54:58.204	2025-10-27 15:54:58.265796	0.00	sol_gain_threshold	performance	f
e1867cc1-83cf-4a2c-81f2-6876e871b8b0	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty reach rank #15 or better by tomorrow?	kitty is currently #20. Can they climb to #15 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:54:58.602	2025-10-27 15:54:58.664093	0.00	rank_improvement	ranking	f
0267bb9d-6e06-49fa-9635-ed713d6f66c9	28045aed-c22a-400a-af25-af765f640bb8	Will Files record a win on tomorrow's leaderboard?	Files has 8 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:54:58.996	2025-10-27 15:54:59.059308	0.00	streak_continuation	performance	f
dbd13ea8-7c8f-41d6-9081-dcc74eeb3281	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Unknown's profitability streak. Currently: 4824.6	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:54:59.396	2025-10-27 15:54:59.463953	0.00	profit_streak	performance	f
7b58c03c-b8f1-4e9e-950e-6e44ef6dcf63	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #1. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	17400.00	20000.00	2600.00	0.8700	0.1300	0.00	f	t	cancelled	2025-10-28 15:54:59.811	2025-10-27 15:54:59.871561	0.00	top_rank_maintain	ranking	f
7a17d590-8a99-46a2-a1b4-5c0c09a8e5cf	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx have a positive USD Gain on tomorrow's leaderboard?	Prediction market for zhynx's profitability streak. Currently: 3716.6	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:00.19	2025-10-27 15:55:00.251779	0.00	profit_streak	performance	f
d048438d-2103-43ef-a637-dd175a507a61	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a top 10 rank on tomorrow's leaderboard?	Jijo is currently #4. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15600.00	20000.00	4400.00	0.7800	0.2200	0.00	f	t	cancelled	2025-10-28 15:55:00.571	2025-10-27 15:55:00.63229	0.00	top_rank_maintain	ranking	f
03cc8282-43e1-4206-b1cf-4f0945276f3f	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox reach rank #10 or better by tomorrow?	Kadenox is currently #13. Can they climb to #10 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:55:00.943	2025-10-27 15:55:01.003563	0.00	rank_improvement	ranking	f
cd36ab8e-bf8d-4b6d-9dbb-badedec57555	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby gain +50 SOL or more by tomorrow?	big bags bobby currently has +38.28 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13187.20	20000.00	6812.80	0.6594	0.3406	0.00	f	t	cancelled	2025-10-28 15:55:01.314	2025-10-27 15:55:01.375412	0.00	sol_gain_threshold	performance	f
74dfff1c-a85e-48dd-98d6-7186087b922e	c8f50e1f-14b5-49dc-8dfd-4d836f72f7b7	Will DJ.Σn record a win on tomorrow's leaderboard?	DJ.Σn has 53 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:01.684	2025-10-27 15:55:01.745032	0.00	streak_continuation	performance	f
40bbea08-4ca7-4140-a2d9-64582825bccb	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Inside Calls currently has a 1.25 W/L ratio (5/4). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9000.00	20000.00	11000.00	0.4500	0.5500	0.00	f	t	cancelled	2025-10-28 15:55:02.084	2025-10-27 15:55:02.16716	0.00	winloss_ratio_maintain	performance	f
c41da3c6-936e-4166-85a3-e6d12ebe2985	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Heyitsyolo's profitability streak. Currently: 2517.2	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:02.558	2025-10-27 15:55:02.621485	0.00	profit_streak	performance	f
29e52b65-390f-47d6-8a82-2f85b69f21ed	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan reach rank #16 or better by tomorrow?	rayan is currently #19. Can they climb to #16 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	yes	2025-10-28 15:55:03.009	2025-10-27 15:55:03.077131	0.00	rank_improvement	ranking	f
1e2677dd-4764-452c-937c-d963839d5d91	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented record a win on tomorrow's leaderboard?	Cented has 34 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:03.539	2025-10-27 15:55:03.605286	0.00	streak_continuation	performance	f
66629d3a-d741-4cdd-8f88-174479178066	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan rank higher than Trenchman on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of rayan (currently #19) vs Trenchman (currently #20)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10100.00	20000.00	9900.00	0.5050	0.4950	0.00	f	t	cancelled	2025-10-28 15:55:03.792	2025-10-27 15:55:03.853871	0.00	rank_flippening	ranking	f
628b3346-b3be-41cc-afed-73898030e2f2	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Will Trenchman gain +50 SOL or more by tomorrow?	Trenchman currently has +11.31 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6714.40	20000.00	13285.60	0.3357	0.6643	0.00	f	t	cancelled	2025-10-28 15:55:03.932	2025-10-27 15:55:03.99274	0.00	sol_gain_threshold	performance	f
1d6dd619-56df-4aa2-ae9f-14e7bf131271	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented have a better win rate than DJ.Σn on tomorrow's leaderboard?	Win rate comparison: Cented (34/32) vs DJ.Σn (53/3)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	5687.23	20000.00	14312.77	0.2844	0.7156	0.00	f	t	cancelled	2025-10-28 15:55:04.177	2025-10-27 15:55:04.237936	0.00	winrate_flippening	performance	f
0913581e-564b-43d5-82e4-7df06673254f	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo gain +50 SOL or more by tomorrow?	Scharo currently has +15.43 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7703.20	20000.00	12296.80	0.3852	0.6148	0.00	f	t	cancelled	2025-10-28 15:55:04.246	2025-10-27 15:55:04.306606	0.00	sol_gain_threshold	performance	f
2f4c25c2-66a5-4ab6-9de7-daeda3ede298	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep maintain a top 10 rank on tomorrow's leaderboard?	Sheep is currently #5. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15000.00	20000.00	5000.00	0.7500	0.2500	0.00	f	t	cancelled	2025-10-28 15:55:04.311	2025-10-27 15:55:04.372295	0.00	top_rank_maintain	ranking	f
b316d3d4-bd81-40cf-8db5-b8015bc28a5e	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	slingoor.usduc currently has a 2.00 W/L ratio (2/1). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	12000.00	20000.00	8000.00	0.6000	0.4000	0.00	f	t	cancelled	2025-10-28 15:55:04.69	2025-10-27 15:55:04.751366	0.00	winloss_ratio_maintain	performance	f
320a12eb-977b-4144-96ab-1818e747949d	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Letterbomb's profitability streak. Currently: 2611.5	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:04.993	2025-10-27 15:55:05.053761	0.00	profit_streak	performance	f
1266e4cc-51bc-4a6e-b408-e0e8a2a3c2fc	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o reach rank #6 or better by tomorrow?	N’o is currently #9. Can they climb to #6 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-28 15:55:05.057	2025-10-27 15:55:05.117776	0.00	rank_improvement	ranking	f
f06f535b-b5d8-480f-922d-e0284dae7fdf	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep maintain a top 10 rank on tomorrow's leaderboard?	Sheep is currently #5. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15000.00	20000.00	5000.00	0.7500	0.2500	0.00	f	t	cancelled	2025-10-28 15:55:05.357	2025-10-27 15:55:05.417999	0.00	top_rank_maintain	ranking	f
9d748420-4dab-4ff0-b564-3036c44c3cfe	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn gain +50 SOL or more by tomorrow?	Jidn currently has +12.85 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7084.00	20000.00	12916.00	0.3542	0.6458	0.00	f	t	cancelled	2025-10-28 15:55:05.424	2025-10-27 15:55:05.486278	0.00	sol_gain_threshold	performance	f
fde4dfbd-94ff-4b1b-8021-ceb8a459d9c5	28045aed-c22a-400a-af25-af765f640bb8	Will Files record a win on tomorrow's leaderboard?	Files has 8 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:05.723	2025-10-27 15:55:05.784154	0.00	streak_continuation	performance	f
8d3fce19-7ae4-439f-b3cf-08573000fd42	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Gake's profitability streak. Currently: 3649.3	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:05.801	2025-10-27 15:55:05.862156	0.00	profit_streak	performance	f
eb044582-22ea-45bf-8f8b-173d7a1f6a8f	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	N’o currently has a 1.33 W/L ratio (8/6). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9333.33	20000.00	10666.67	0.4667	0.5333	0.00	f	t	cancelled	2025-10-28 15:55:06.094	2025-10-27 15:55:06.155795	0.00	winloss_ratio_maintain	performance	f
99022ed6-a01d-42fe-ac0b-3b870c966373	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Ban currently has a 1.20 W/L ratio (6/5). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	8800.00	20000.00	11200.00	0.4400	0.5600	0.00	f	t	cancelled	2025-10-28 15:55:06.544	2025-10-27 15:55:06.605118	0.00	winloss_ratio_maintain	performance	f
b025c92b-bd50-440f-bc40-35ac37dd1c3f	9a76d553-5287-4006-8315-a03392ced768	Will dv reach rank #5 or better by tomorrow?	dv is currently #15. Can they climb to #5 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-28 15:55:06.882	2025-10-27 15:55:06.942754	0.00	rank_improvement	ranking	f
fbe5f1b8-da61-47ee-85ed-2aac30538ab5	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Jidn's profitability streak. Currently: 2575.1	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:06.501	2025-10-27 15:55:06.563695	0.00	profit_streak	performance	f
943faa17-c3aa-43bc-8de1-2b1d605dab24	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora rank higher than BIGWARZ on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Pandora (currently #19) vs BIGWARZ (currently #15)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9600.00	20000.00	10400.00	0.4800	0.5200	0.00	f	t	cancelled	2025-10-28 15:55:06.917	2025-10-27 15:55:06.978959	0.00	rank_flippening	ranking	f
b94a216a-d009-4b1a-b971-18849e5beff6	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 record a win on tomorrow's leaderboard?	M A M B A 🧲 has 713 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:07.258	2025-10-27 15:55:07.319287	0.00	streak_continuation	performance	f
5713e604-41ac-4b36-8f01-76aa5d406c4d	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake gain +50 SOL or more by tomorrow?	Gake currently has +18.22 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	8372.80	20000.00	11627.20	0.4186	0.5814	0.00	f	t	cancelled	2025-10-28 15:55:08.021	2025-10-27 15:55:08.081759	0.00	sol_gain_threshold	performance	f
47fb2476-df46-40cf-afa4-bd6b38767b53	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown maintain a top 10 rank on tomorrow's leaderboard?	Unknown is currently #10. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	12000.00	20000.00	8000.00	0.6000	0.4000	0.00	f	t	cancelled	2025-10-28 15:55:08.412	2025-10-27 15:55:08.47352	0.00	top_rank_maintain	ranking	f
377ccb4b-8d59-4001-b7af-44ee119cad2b	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix gain +50 SOL or more by tomorrow?	Publix currently has +14.17 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7400.80	20000.00	12599.20	0.3700	0.6300	0.00	f	t	cancelled	2025-10-28 15:55:08.802	2025-10-27 15:55:08.868437	0.00	sol_gain_threshold	performance	f
ea466b10-7998-433b-8a14-88ae1d2e16e6	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx have a positive USD Gain on tomorrow's leaderboard?	Prediction market for zhynx's profitability streak. Currently: 3716.6	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:09.191	2025-10-27 15:55:09.25217	0.00	profit_streak	performance	f
d11210a6-85d9-40a0-8618-c7b63a865d71	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox record a win on tomorrow's leaderboard?	Kadenox has 20 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:09.57	2025-10-27 15:55:09.632099	0.00	streak_continuation	performance	f
4b658249-fb94-43be-9ce9-1f1c4dc706a8	613a324c-091b-4948-a69b-5144b04bb933	Will West reach rank #1 or better by tomorrow?	West is currently #6. Can they climb to #1 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:55:09.941	2025-10-27 15:55:10.003039	0.00	rank_improvement	ranking	f
6d0503ce-7038-4933-b8a1-4e45b1536a7d	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.83 W/L ratio (249/88). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11318.18	20000.00	8681.82	0.5659	0.4341	0.00	f	t	cancelled	2025-10-28 15:55:10.321	2025-10-27 15:55:10.382084	0.00	winloss_ratio_maintain	performance	f
96d9313f-5c98-4bcf-9e4e-788f679eb3c8	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a top 10 rank on tomorrow's leaderboard?	Jijo is currently #4. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15600.00	20000.00	4400.00	0.7800	0.2200	0.00	f	t	cancelled	2025-10-28 15:55:10.7	2025-10-27 15:55:10.762113	0.00	top_rank_maintain	ranking	f
f6502f65-a0cb-4368-be63-81784216293e	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban gain +50 SOL or more by tomorrow?	Ban currently has +30.76 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11382.40	20000.00	8617.60	0.5691	0.4309	0.00	f	t	cancelled	2025-10-28 15:55:11.087	2025-10-27 15:55:11.149097	0.00	sol_gain_threshold	performance	f
b7df6410-5bca-4750-a349-ae5d63bff3ce	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc reach rank #11 or better by tomorrow?	slingoor.usduc is currently #16. Can they climb to #11 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	f	t	no	2025-10-28 15:55:11.49	2025-10-27 15:55:11.553185	0.00	rank_improvement	ranking	f
416020ce-6a06-4692-957d-f6a248411911	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty have a positive USD Gain on tomorrow's leaderboard?	Prediction market for kitty's profitability streak. Currently: 2465.5	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-28 15:55:11.869	2025-10-27 15:55:11.93075	0.00	profit_streak	performance	f
e0c63687-7fdb-4f10-b12d-858f10d8f1d5	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo record a win on tomorrow's leaderboard?	Heyitsyolo has 27 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:12.25	2025-10-27 15:55:12.310742	0.00	streak_continuation	performance	f
3916455c-6663-4450-8a9a-333465aa3e8b	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	iconXBT currently has a 2.83 W/L ratio (34/12). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11333.33	20000.00	8666.67	0.5667	0.4333	0.00	f	t	cancelled	2025-10-28 15:55:12.636	2025-10-27 15:55:12.697481	0.00	winloss_ratio_maintain	performance	f
19985202-24fc-4df6-84c8-660030f11f01	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar rank higher than Pandora on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of oscar (currently #18) vs Pandora (currently #19)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10100.00	20000.00	9900.00	0.5050	0.4950	0.00	f	t	cancelled	2025-10-28 15:55:13.026	2025-10-27 15:55:13.090364	0.00	rank_flippening	ranking	f
11e1fe6c-07dc-4463-a338-de6f7bab83aa	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ reach rank #5 or better by tomorrow?	BIGWARZ is currently #15. Can they climb to #5 or higher?	pending	10000.00	10000.00	0.5121	0.4879	19521.72	19521.72	20490.00	20490.00	0.5121	0.4879	500.00	f	t	no	2025-10-28 15:55:04.617	2025-10-27 15:55:04.67834	0.00	rank_improvement	ranking	f
559ab1fb-bb2b-4949-835f-f08bf7dcd4bb	14422aeb-caa1-44e6-9df0-b33ccb41dd12	gr3g to gain +1000 SOL	Will gr3g (gr3g) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.742	2025-10-28 02:00:05.747054	0.00	kolscan	general	f
cc9ee5fe-6a98-43eb-8ee2-dcd46e91bbae	0f08bb54-8367-46f1-b980-a98e935778c4	Danny to gain +1000 SOL	Will Danny (danny) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.752	2025-10-28 02:00:05.755691	0.00	kolscan	general	f
207b2b82-705c-463f-b9a0-755dafa21884	31c67b34-da6a-4223-96e5-bc014f7773d0	aloh to gain +1000 SOL	Will aloh (aloh) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.758	2025-10-28 02:00:05.763277	0.00	kolscan	general	f
d7f93488-b9f3-42b9-8aeb-eb22db2846f1	e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	radiance to gain +30 SOL	Will radiance (radiance) achieve a total SOL gain of +30 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.774	2025-10-28 02:00:05.778964	0.00	kolscan	general	f
d6c664be-b56b-4367-8deb-c46da5c7dec9	d8629eb3-c067-4dbd-96c1-7857a8ad716f	Cooker to gain +20 SOL	Will Cooker (cooker) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.781	2025-10-28 02:00:05.785759	0.00	kolscan	general	f
507c18e3-ffc5-4d76-bee0-be70e4bbdf9e	e8b3cdff-6c8e-4eeb-9a4b-b1e7f0bec093	Pain to gain +20 SOL	Will Pain (pain) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.79	2025-10-28 02:00:05.793829	0.00	kolscan	general	f
fc84dd9d-8c8e-40ed-8a52-046304199c4b	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb have a better win rate than iconXBT on tomorrow's leaderboard?	Win rate comparison: Letterbomb (18/32) vs iconXBT (39/15)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6377.78	20000.00	13622.22	0.3189	0.6811	0.00	f	t	cancelled	2025-10-29 03:00:00.576	2025-10-28 03:00:00.58233	0.00	winrate_flippening	performance	f
c539c1de-b148-4484-b511-c0ffd4dbdee2	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o rank higher than Inside Calls on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of N’o (currently #9) vs Inside Calls (currently #14)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10500.00	20000.00	9500.00	0.5250	0.4750	0.00	f	t	cancelled	2025-10-29 03:00:00.928	2025-10-28 03:00:00.933318	0.00	rank_flippening	ranking	f
949c1f6f-87b9-4f7c-a35f-60dcb0dfa3bd	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Kev's profitability streak. Currently: 1662.7	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-29 03:00:00.95	2025-10-28 03:00:00.95409	0.00	profit_streak	performance	f
cc89af51-0a65-4a68-ae78-476cbfff3031	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby record a win on tomorrow's leaderboard?	big bags bobby has 5 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:01.269	2025-10-28 03:00:01.272391	0.00	streak_continuation	performance	f
34598253-3bfc-4dba-9f59-51f56ff33234	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #2. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	16800.00	20000.00	3200.00	0.8400	0.1600	0.00	f	t	cancelled	2025-10-29 03:00:01.588	2025-10-28 03:00:01.591546	0.00	top_rank_maintain	ranking	f
ebbeaee4-c592-463c-a89f-3afec154f2cb	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo reach rank #8 or better by tomorrow?	Scharo is currently #11. Can they climb to #8 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-29 03:00:01.908	2025-10-28 03:00:01.912329	0.00	rank_improvement	ranking	f
79135664-f287-4684-8b66-4641a93cb1c1	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Jidn currently has a 1.50 W/L ratio (6/4). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:02.227	2025-10-28 03:00:02.230568	0.00	winloss_ratio_maintain	performance	f
ba64ad83-cce5-435c-8844-4c6d1b7599d4	f3c9a444-0ead-4253-901a-69517f1d4a28	Will Publix gain +50 SOL or more by tomorrow?	Publix currently has +14.17 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	7400.80	20000.00	12599.20	0.3700	0.6300	0.00	f	t	cancelled	2025-10-29 03:00:02.546	2025-10-28 03:00:02.549276	0.00	sol_gain_threshold	performance	f
917a43b6-d78e-4a11-90af-9dad04fbf689	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a top 10 rank on tomorrow's leaderboard?	Jijo is currently #5. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	15000.00	20000.00	5000.00	0.7500	0.2500	0.00	f	t	cancelled	2025-10-29 03:00:02.864	2025-10-28 03:00:02.868175	0.00	top_rank_maintain	ranking	f
67fc7ee1-b9a3-42e5-94dd-cd025c64353d	31c67b34-da6a-4223-96e5-bc014f7773d0	Will aloh record a win on tomorrow's leaderboard?	aloh has 30 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:03.182	2025-10-28 03:00:03.185063	0.00	streak_continuation	performance	f
ee90b393-a575-4b3d-9e28-cdc22c64ff14	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo reach rank #9 or better by tomorrow?	Heyitsyolo is currently #19. Can they climb to #9 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-29 03:00:03.498	2025-10-28 03:00:03.500228	0.00	rank_improvement	ranking	f
a1af1189-8536-4970-a3ac-0a7eb191d9ca	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Pandora's profitability streak. Currently: 1928.1	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-29 03:00:03.814	2025-10-28 03:00:03.817068	0.00	profit_streak	performance	f
a2fe981e-da92-4326-a45b-e8e7d121caee	14422aeb-caa1-44e6-9df0-b33ccb41dd12	Will gr3g gain +250 SOL or more by tomorrow?	gr3g currently has +112.47 SOL gain. Can they reach +250 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9398.56	20000.00	10601.44	0.4699	0.5301	0.00	f	t	cancelled	2025-10-29 03:00:04.129	2025-10-28 03:00:04.132183	0.00	sol_gain_threshold	performance	f
5e712dd7-58ee-43d2-9c71-a6e9a7a86021	d8629eb3-c067-4dbd-96c1-7857a8ad716f	Will Cooker maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Cooker currently has a 2.60 W/L ratio (13/5). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10400.00	20000.00	9600.00	0.5200	0.4800	0.00	f	t	cancelled	2025-10-29 03:00:04.446	2025-10-28 03:00:04.448229	0.00	winloss_ratio_maintain	performance	f
326c5beb-a0e5-432d-9ce1-60cc09faef39	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #7. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13800.00	20000.00	6200.00	0.6900	0.3100	0.00	f	t	cancelled	2025-10-29 03:00:04.762	2025-10-28 03:00:04.765195	0.00	top_rank_maintain	ranking	f
55c7c00b-2801-4dc0-b2e2-9c2cdafab625	28045aed-c22a-400a-af25-af765f640bb8	Will Files gain +50 SOL or more by tomorrow?	Files currently has +33.79 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	12109.60	20000.00	7890.40	0.6055	0.3945	0.00	f	t	cancelled	2025-10-29 03:00:05.078	2025-10-28 03:00:05.081361	0.00	sol_gain_threshold	performance	f
4059724b-5b60-4275-8cde-05e942af4c14	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Gake's profitability streak. Currently: 3649.3	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-29 03:00:05.394	2025-10-28 03:00:05.396631	0.00	profit_streak	performance	f
cade8bf2-4ca0-44fa-83e6-917d79dad532	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox record a win on tomorrow's leaderboard?	Kadenox has 20 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:05.71	2025-10-28 03:00:05.713037	0.00	streak_continuation	performance	f
fda429cd-a69f-4a83-b3f7-02592b9bd6de	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown reach rank #6 or better by tomorrow?	Unknown is currently #9. Can they climb to #6 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	f	t	no	2025-10-29 03:00:06.027	2025-10-28 03:00:06.029312	0.00	rank_improvement	ranking	f
9c44dac0-5fd1-4bcc-97a8-437de0566b99	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.83 W/L ratio (249/88). Can they stay above 2.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11318.18	20000.00	8681.82	0.5659	0.4341	0.00	f	t	cancelled	2025-10-28 15:54:57.782	2025-10-27 15:54:57.844986	0.00	winloss_ratio_maintain	performance	f
90f4960d-edd8-4c34-b354-ab2a451ca153	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar record a win on tomorrow's leaderboard?	oscar has 16 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-28 15:55:06.174	2025-10-27 15:55:06.234911	0.00	streak_continuation	performance	f
a844eed8-ac67-48b4-92ef-d2d7c81819c0	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	big bags bobby currently has a 1.40 W/L ratio (7/5). Can they stay above 1.50?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9600.00	20000.00	10400.00	0.4800	0.5200	0.00	f	t	cancelled	2025-10-28 15:55:07.638	2025-10-27 15:55:07.699676	0.00	winloss_ratio_maintain	performance	f
eb27b294-3361-4697-ab2d-2b23bafb171f	a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Beaver to gain +45 SOL	Will Beaver (beaver) achieve a total SOL gain of +45 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 02:00:05.765	2025-10-28 02:00:05.770489	0.00	kolscan	general	f
7c2f61ed-92ad-455a-a8ba-3b0da2af4f07	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc maintain a win/loss ratio above 2.00 on tomorrow's leaderboard?	slingoor.usduc currently has a 2.00 W/L ratio (2/1). Can they stay above 2.00?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:06.344	2025-10-28 03:00:06.346866	0.00	winloss_ratio_maintain	performance	f
9c3cbcb0-4552-428f-9ab5-48a55d4c31b5	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty gain +50 SOL or more by tomorrow?	kitty currently has +12.31 SOL gain. Can they reach +50 SOL or higher?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	6954.40	20000.00	13045.60	0.3477	0.6523	0.00	f	t	cancelled	2025-10-29 03:00:06.66	2025-10-28 03:00:06.662577	0.00	sol_gain_threshold	performance	f
7df61569-5f88-4991-8a8c-5b588d0cc3d7	e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	Will radiance reach rank #1 or better by tomorrow?	radiance is currently #11. Can they climb to #1 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	f	t	no	2025-10-29 03:00:06.975	2025-10-28 03:00:06.978153	0.00	rank_improvement	ranking	f
fcb660d3-57de-430b-9495-3b56f8dd8dda	0f08bb54-8367-46f1-b980-a98e935778c4	Will Danny maintain a top 10 rank on tomorrow's leaderboard?	Danny is currently #3. Can they stay in the top 10?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	16200.00	20000.00	3800.00	0.8100	0.1900	0.00	f	t	cancelled	2025-10-29 03:00:07.293	2025-10-28 03:00:07.295529	0.00	top_rank_maintain	ranking	f
413cfc23-c7c2-413e-a4ac-74008d77d70e	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep record a win on tomorrow's leaderboard?	Sheep has 17731 wins. Can they add another?	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	cancelled	2025-10-29 03:00:07.612	2025-10-28 03:00:07.617001	0.00	streak_continuation	performance	f
2384c16d-86fc-43eb-89ec-69296d305fae	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan have a positive USD Gain on tomorrow's leaderboard?	Prediction market for rayan's profitability streak. Currently: 9674.9	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	f	t	cancelled	2025-10-29 03:00:07.931	2025-10-28 03:00:07.934445	0.00	profit_streak	performance	f
b375f605-1082-4bf1-b85c-173e1dd05697	a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Will Beaver rank higher than Cented on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Beaver (currently #8) vs Cented (currently #18)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	11000.00	20000.00	9000.00	0.5500	0.4500	0.00	f	t	cancelled	2025-10-29 03:00:08.249	2025-10-28 03:00:08.251963	0.00	rank_flippening	ranking	f
70000e3c-29fb-420a-aab3-9fb15d2b3bd3	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx rank higher than Ban on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of zhynx (currently #12) vs Ban (currently #19)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10700.00	20000.00	9300.00	0.5350	0.4650	0.00	f	t	cancelled	2025-10-29 03:00:08.568	2025-10-28 03:00:08.570754	0.00	rank_flippening	ranking	f
f6c20dd6-940d-4e59-9632-341650a6f2d5	9a76d553-5287-4006-8315-a03392ced768	Will dv rank higher than Trenchman on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of dv (currently #15) vs Trenchman (currently #20)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	10500.00	20000.00	9500.00	0.5250	0.4750	0.00	f	t	cancelled	2025-10-29 03:00:08.882	2025-10-28 03:00:08.885816	0.00	rank_flippening	ranking	f
b676be62-7c7c-4d2a-b7e1-a1bcca47f9f3	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar rank higher than Pain on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of oscar (currently #18) vs Pain (currently #17)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	9900.00	20000.00	10100.00	0.4950	0.5050	0.00	f	t	cancelled	2025-10-29 03:00:09.198	2025-10-28 03:00:09.201037	0.00	rank_flippening	ranking	f
d6a9e081-4773-4011-89f3-b3eb261555d8	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ rank higher than DJ.Σn on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of BIGWARZ (currently #20) vs DJ.Σn (currently #8)	cancelled	10000.00	10000.00	0.5000	0.5000	20000.00	8800.00	20000.00	11200.00	0.4400	0.5600	0.00	f	t	cancelled	2025-10-29 03:00:09.512	2025-10-28 03:00:09.514821	0.00	rank_flippening	ranking	f
8be21d00-6178-4ac5-8531-67fc88ebfd6c	2401af33-61c9-443b-9e2f-c4f8a312792e	WaiterG to gain +1000 SOL	Will WaiterG (waiterg) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.381	2025-10-28 23:15:33.386903	0.00	kolscan	general	f
0e136ac0-39ff-4e6c-a07f-8a6188656156	14422aeb-caa1-44e6-9df0-b33ccb41dd12	gr3g to gain +1000 SOL	Will gr3g (gr3g) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.388	2025-10-28 23:15:33.393369	0.00	kolscan	general	f
538482a1-e434-4982-9186-62986dd20525	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	iconXBT to gain +35 SOL	Will iconXBT (iconxbt) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.394	2025-10-28 23:15:33.399284	0.00	kolscan	general	f
1f29a983-e591-49d7-be3f-010480afd2c8	48fd5bc9-7b30-41e8-a7c5-98387139c979	Gake to gain +35 SOL	Will Gake (gake) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.4	2025-10-28 23:15:33.405114	0.00	kolscan	general	f
adfc3bdb-b16e-416b-85e1-e9eac014a967	fe853fd3-8ea4-4a84-a12d-5004e40ec4c1	h14 to gain +35 SOL	Will h14 (h14) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.406	2025-10-28 23:15:33.410849	0.00	kolscan	general	f
9ae017cf-0c2d-4beb-8b0f-d02794134ef3	a5e16c37-a634-4ce3-a3fc-57f972fd10fc	ozark to gain +30 SOL	Will ozark (ozark) achieve a total SOL gain of +30 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.411	2025-10-28 23:15:33.416341	0.00	kolscan	general	f
658ccef7-c434-4941-a1d8-6de9db053bdd	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Kev to gain +30 SOL	Will Kev (kev) achieve a total SOL gain of +30 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.417	2025-10-28 23:15:33.422932	0.00	kolscan	general	f
30e4f254-37db-48dc-813c-614d0003f5a5	502a8fee-21f9-42eb-8784-9c4b55ea4f30	zhynx to gain +1000 SOL	Will zhynx (zhynx) achieve a total SOL gain of +1000 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.372	2025-10-28 23:15:33.380086	0.00	kolscan	general	f
da034293-49fb-4e13-8bd3-d4d252b98565	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Cented to gain +25 SOL	Will Cented (cented) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.423	2025-10-28 23:15:33.428263	0.00	kolscan	general	f
59562ab2-5fed-4684-939e-7b42f3991dbe	e01c26b6-ede0-4b84-ae60-9af4b7ca0cd7	Little Mustacho 🐕 to gain +25 SOL	Will Little Mustacho 🐕 (littlemustacho🐕) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.43	2025-10-28 23:15:33.434666	0.00	kolscan	general	f
fac1513f-f418-417a-9b3c-a0311295b572	c47d2e86-6f9c-4fe3-b718-715da4f65586	big bags bobby to gain +25 SOL	Will big bags bobby (bigbagsbobby) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.435	2025-10-28 23:15:33.440298	0.00	kolscan	general	f
df3e4756-76dc-4cb7-bea4-4cf5082d49f3	8dde432d-15ac-421a-b758-82f772df4b0d	clukz to gain +25 SOL	Will clukz (clukz) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.441	2025-10-28 23:15:33.445933	0.00	kolscan	general	f
2ff21905-cf26-4d25-9edf-9135e76540c3	6a2a833b-9f09-4589-9f2a-7dba1743f31f	waste management to gain +25 SOL	Will waste management (wastemanagement) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.446	2025-10-28 23:15:33.451519	0.00	kolscan	general	f
d6c88a1e-8d67-42d2-a70a-c10c7447684b	333046b1-5768-4cd5-8e8e-b160f88a1146	lucas to gain +20 SOL	Will lucas (lucas) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.453	2025-10-28 23:15:33.456539	0.00	kolscan	general	f
ee475da2-68e4-4509-be9c-d8af42ffc54b	5f1b471e-824c-4f87-b996-834147d61a66	Jeets to gain +20 SOL	Will Jeets (jeets) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.457	2025-10-28 23:15:33.460558	0.00	kolscan	general	f
c5627b34-bb7b-41bf-92e0-f71b1f3f40e9	a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Beaver to gain +20 SOL	Will Beaver (beaver) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.461	2025-10-28 23:15:33.466788	0.00	kolscan	general	f
fea56aaf-897f-47cf-b3ff-0d16891dc28e	e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	radiance to gain +20 SOL	Will radiance (radiance) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.467	2025-10-28 23:15:33.472303	0.00	kolscan	general	f
c18d383c-7f14-4558-b062-41f8474dbc4d	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Kadenox to gain +15 SOL	Will Kadenox (kadenox) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.473	2025-10-28 23:15:33.477079	0.00	kolscan	general	f
5c8552e2-ff98-4345-8f88-47459cb0bc26	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	N’o to gain +15 SOL	Will N’o (n’o) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	f	t	no	2025-11-04 23:15:33.477	2025-10-28 23:15:33.48204	0.00	kolscan	general	f
de9f0b13-259c-495c-8497-072ec8d45331	a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Will Beaver have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Beaver's profitability streak. Currently: 3448.5	pending	10000.00	10000.00	0.5109	0.4891	19569.53	19569.53	20439.92	20439.92	0.5109	0.4891	756.00	t	f	\N	2025-10-29 23:16:18.784	2025-10-28 23:16:18.791672	0.00	profit_streak	performance	f
21649439-df19-49a7-bd15-18cb5f39aeb9	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Letterbomb's profitability streak. Currently: 3929.6	pending	10000.00	10000.00	0.5528	0.4472	17989.82	17989.82	22234.80	22234.80	0.5528	0.4472	5707.00	t	f	\N	2025-10-29 23:16:20.384	2025-10-28 23:16:20.389424	0.00	profit_streak	performance	f
e3183a8b-006f-43f1-bce5-beecd73e4505	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby record a win on tomorrow's leaderboard?	big bags bobby has 4 wins. Can they add another?	pending	10000.00	10000.00	0.5102	0.4898	19597.18	19597.18	20411.11	20411.11	0.5102	0.4898	1362.00	t	f	\N	2025-10-29 23:16:18.143	2025-10-28 23:16:18.146814	0.00	streak_continuation	performance	f
41fc85d3-13b2-4e7b-8d04-2db65c3a5675	2401af33-61c9-443b-9e2f-c4f8a312792e	Will WaiterG maintain a top 10 rank on tomorrow's leaderboard?	WaiterG is currently #2. Can they stay in the top 10?	pending	10000.00	10000.00	0.5274	0.4726	18931.90	18931.90	21128.38	21128.38	0.5274	0.4726	1172.00	t	f	\N	2025-10-29 23:16:20.703	2025-10-28 23:16:20.706817	0.00	top_rank_maintain	ranking	f
e2b697e2-deda-4171-a6d9-0d1c66ba888f	14422aeb-caa1-44e6-9df0-b33ccb41dd12	Will gr3g gain +100 SOL or more by tomorrow?	gr3g currently has +80.49 SOL gain. Can they reach +100 SOL or higher?	pending	10000.00	10000.00	0.5520	0.4480	18016.09	18016.09	22202.36	22202.36	0.5520	0.4480	3643.00	t	f	\N	2025-10-29 23:16:20.063	2025-10-28 23:16:20.070888	0.00	sol_gain_threshold	performance	f
d56f2224-6c29-4110-8330-33dec782a2e2	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc reach rank #11 or better by tomorrow?	slingoor.usduc is currently #16. Can they climb to #11 or higher?	pending	10000.00	10000.00	0.5460	0.4540	18236.53	18236.53	21934.00	21934.00	0.5460	0.4540	2360.45	t	f	\N	2025-10-29 23:16:19.745	2025-10-28 23:16:19.748831	0.00	rank_improvement	ranking	f
2f04d2b4-a630-4e96-8015-c5022e6c1b48	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Jijo currently has a 1.54 W/L ratio (20/13). Can they stay above 1.50?	pending	10000.00	10000.00	0.4988	0.5012	20046.05	20046.05	19954.04	19954.04	0.4988	0.5012	650.00	t	f	\N	2025-10-29 23:16:19.425	2025-10-28 23:16:19.430562	0.00	winloss_ratio_maintain	performance	f
41efe570-c5e6-4f03-a3a9-003e1c80db46	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo gain +50 SOL or more by tomorrow?	Scharo currently has +15.43 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5163	0.4837	19359.98	19359.98	20661.18	20661.18	0.5163	0.4837	1924.10	t	f	\N	2025-10-29 23:16:18.463	2025-10-28 23:16:18.468626	0.00	sol_gain_threshold	performance	f
f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	0f08bb54-8367-46f1-b980-a98e935778c4	Will Danny maintain a top 10 rank on tomorrow's leaderboard?	Danny is currently #3. Can they stay in the top 10?	pending	10000.00	10000.00	0.5046	0.4954	19817.88	19817.88	20183.78	20183.78	0.5046	0.4954	2601.90	t	f	\N	2025-10-29 23:16:19.106	2025-10-28 23:16:19.111578	0.00	top_rank_maintain	ranking	f
5ad16a19-1481-47b8-a791-69b314373c90	9a76d553-5287-4006-8315-a03392ced768	Will dv have a positive USD Gain on tomorrow's leaderboard?	Prediction market for dv's profitability streak. Currently: 3427.9	pending	10000.00	10000.00	0.5037	0.4963	19853.27	19853.27	20147.81	20147.81	0.5037	0.4963	271.00	t	f	\N	2025-10-29 23:16:24.857	2025-10-28 23:16:24.862624	0.00	profit_streak	performance	f
34c43b93-174a-4546-9ad6-97bde99d37dc	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 maintain a top 10 rank on tomorrow's leaderboard?	M A M B A 🧲 is currently #7. Can they stay in the top 10?	pending	10000.00	10000.00	0.5138	0.4862	19456.57	19456.57	20558.60	20558.60	0.5138	0.4862	570.00	t	f	\N	2025-10-29 23:16:24.215	2025-10-28 23:16:24.220123	0.00	top_rank_maintain	ranking	f
d34373d6-1998-4d30-ad8b-86693941de64	e01c26b6-ede0-4b84-ae60-9af4b7ca0cd7	Will Little Mustacho 🐕 record a win on tomorrow's leaderboard?	Little Mustacho 🐕 has 3 wins. Can they add another?	pending	10000.00	10000.00	0.5042	0.4958	19833.82	19833.82	20167.58	20167.58	0.5042	0.4958	171.00	t	f	\N	2025-10-29 23:16:23.896	2025-10-28 23:16:23.90116	0.00	streak_continuation	performance	f
c05312e8-40bf-42a8-a95e-443f391f6045	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls maintain a win/loss ratio above 1.50 on tomorrow's leaderboard?	Inside Calls currently has a 1.25 W/L ratio (5/4). Can they stay above 1.50?	pending	10000.00	10000.00	0.5042	0.4958	19832.85	19832.85	20168.56	20168.56	0.5042	0.4958	172.00	t	f	\N	2025-10-29 23:16:21.662	2025-10-28 23:16:21.666083	0.00	winloss_ratio_maintain	performance	f
d5812241-a74a-4d80-81d3-eab0c8af3b5b	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown maintain a top 10 rank on tomorrow's leaderboard?	Unknown is currently #9. Can they stay in the top 10?	pending	10000.00	10000.00	0.5112	0.4888	19558.19	19558.19	20451.78	20451.78	0.5112	0.4888	461.00	t	f	\N	2025-10-29 23:16:22.938	2025-10-28 23:16:22.942792	0.00	top_rank_maintain	ranking	f
ce750e89-ae58-40aa-8b69-ef078c54aff4	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar reach rank #13 or better by tomorrow?	oscar is currently #18. Can they climb to #13 or higher?	pending	10000.00	10000.00	0.5017	0.4983	19930.65	19930.65	20069.58	20069.58	0.5017	0.4983	71.00	t	f	\N	2025-10-29 23:16:22.619	2025-10-28 23:16:22.623858	0.00	rank_improvement	ranking	f
f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	d8629eb3-c067-4dbd-96c1-7857a8ad716f	Will Cooker gain +50 SOL or more by tomorrow?	Cooker currently has +18.60 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5039	0.4961	19843.46	19843.46	20157.78	20157.78	0.5039	0.4961	161.00	t	f	\N	2025-10-29 23:16:25.179	2025-10-28 23:16:25.18446	0.00	sol_gain_threshold	performance	f
36d4b50a-987e-4b93-864b-aca00db121f7	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ reach rank #10 or better by tomorrow?	BIGWARZ is currently #20. Can they climb to #10 or higher?	pending	10000.00	10000.00	0.5032	0.4968	19871.47	19871.47	20129.36	20129.36	0.5032	0.4968	330.00	t	f	\N	2025-10-29 23:16:26.778	2025-10-28 23:16:26.783685	0.00	rank_improvement	ranking	f
76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	02a20037-4254-40b0-8310-5d188c664fc9	Will Jidn maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	Jidn currently has a 1.50 W/L ratio (6/4). Can they stay above 1.75?	pending	10000.00	10000.00	0.5003	0.4997	19989.22	19989.22	20010.78	20010.78	0.5003	0.4997	11.00	t	f	\N	2025-10-29 23:16:23.576	2025-10-28 23:16:23.581282	0.00	winloss_ratio_maintain	performance	f
5877484f-f8a2-41b8-8889-7bac69f1c993	a5e16c37-a634-4ce3-a3fc-57f972fd10fc	Will ozark have a positive USD Gain on tomorrow's leaderboard?	Prediction market for ozark's profitability streak. Currently: 5264.1	pending	10000.00	10000.00	0.5005	0.4995	19980.41	19980.41	20019.60	20019.60	0.5005	0.4995	20.00	t	f	\N	2025-10-29 23:16:22.299	2025-10-28 23:16:22.304087	0.00	profit_streak	performance	f
d30c9b38-20d5-4921-9666-2efdd14c2a6a	43b22d3e-4e94-4597-9ac7-76b163c8cd24	Will Ban gain +50 SOL or more by tomorrow?	Ban currently has +16.17 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.4895	0.5105	20423.51	20423.51	19585.28	19585.28	0.4895	0.5105	663.00	t	f	\N	2025-10-29 23:16:21.98	2025-10-28 23:16:21.985409	0.00	sol_gain_threshold	performance	f
ad076954-b6fe-487f-aa79-8c2cbfdb62e4	31c67b34-da6a-4223-96e5-bc014f7773d0	Will aloh record a win on tomorrow's leaderboard?	aloh has 30 wins. Can they add another?	pending	10000.00	10000.00	0.5003	0.4997	19989.22	19989.22	20010.78	20010.78	0.5003	0.4997	11.00	t	f	\N	2025-10-29 23:16:23.256	2025-10-28 23:16:23.260963	0.00	streak_continuation	performance	f
e2671622-4131-4733-8176-eb9c27780278	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.00 on tomorrow's leaderboard?	Kev currently has a 2.35 W/L ratio (259/110). Can they stay above 2.00?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:25.499	2025-10-28 23:16:25.503905	0.00	winloss_ratio_maintain	performance	f
d827611b-bd78-4f00-a05c-b68859aefca5	28045aed-c22a-400a-af25-af765f640bb8	Will Files rank higher than clukz on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Files (currently #3) vs clukz (currently #12)	pending	10000.00	10000.00	0.5005	0.4995	19979.44	19979.44	20020.58	20020.58	0.5005	0.4995	21.00	t	f	\N	2025-10-29 23:16:27.736	2025-10-28 23:16:27.741771	0.00	rank_flippening	ranking	f
91c019e2-7233-495a-988a-8d4c7cdccd2b	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Sheep's profitability streak. Currently: 2760.8	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:26.137	2025-10-28 23:16:26.143054	0.00	profit_streak	performance	f
6018a059-bdde-4605-8636-8c8ab7fadd6e	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox reach rank #13 or better by tomorrow?	Kadenox is currently #18. Can they climb to #13 or higher?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:24.537	2025-10-28 23:16:24.542337	0.00	rank_improvement	ranking	f
20250d49-1b4b-4096-a17c-6a6de8e21747	333046b1-5768-4cd5-8e8e-b160f88a1146	Will lucas record a win on tomorrow's leaderboard?	lucas has 3 wins. Can they add another?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:26.458	2025-10-28 23:16:26.463948	0.00	streak_continuation	performance	f
ef4592dd-1cc6-4da6-80ad-c185d04b83e8	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #2. Can they stay in the top 10?	pending	10000.00	10000.00	0.5037	0.4963	19854.07	19854.07	20147.00	20147.00	0.5037	0.4963	150.00	t	f	\N	2025-10-29 23:16:25.818	2025-10-28 23:16:25.823334	0.00	top_rank_maintain	ranking	f
5eb75da5-3e9c-4ddf-a60a-8960dccb0ea0	502a8fee-21f9-42eb-8784-9c4b55ea4f30	Will zhynx rank higher than DJ.Σn on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of zhynx (currently #1) vs DJ.Σn (currently #8)	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:28.056	2025-10-28 23:16:28.061928	0.00	rank_flippening	ranking	f
696b7e3f-44bb-408f-b490-482f4fb7bcc2	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Will Trenchman gain +50 SOL or more by tomorrow?	Trenchman currently has +11.31 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.4777	0.5223	20914.52	20914.52	19125.47	19125.47	0.4777	0.5223	1059.00	t	f	\N	2025-10-29 23:16:27.098	2025-10-28 23:16:27.102955	0.00	sol_gain_threshold	performance	f
c874aa81-c994-4238-bb51-1b6a3edbc40c	e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	Will radiance rank higher than Publix on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of radiance (currently #17) vs Publix (currently #13)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9600.00	20000.00	10400.00	0.4800	0.5200	0.00	t	f	\N	2025-10-29 23:16:28.377	2025-10-28 23:16:28.38087	0.00	rank_flippening	ranking	f
51fbe44c-ea10-43ad-ab46-37722bbe1409	6a2a833b-9f09-4589-9f2a-7dba1743f31f	Will waste management rank higher than N’o on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of waste management (currently #13) vs N’o (currently #19)	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-10-29 23:16:28.696	2025-10-28 23:16:28.701033	0.00	rank_flippening	ranking	f
153ca650-c833-4e43-8821-9df7b757ec29	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	iconXBT to gain +35 SOL	Will iconXBT (iconxbt) achieve a total SOL gain of +35 or more by the end of the week?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-11-05 02:00:07.24	2025-10-29 02:00:07.244232	0.00	kolscan	general	f
34a0781e-cde7-4eec-ac89-fdad71893214	a96fc177-ac49-4488-a316-361d14cbed4a	para to gain +15 SOL	Will para (para) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5015	0.4985	19941.37	19941.37	20058.80	20058.80	0.5015	0.4985	60.00	t	f	\N	2025-11-05 02:00:07.297	2025-10-29 02:00:07.30123	0.00	kolscan	general	f
5b4c6405-94b6-4e20-a87b-c5ec6256786f	a87eb3fb-4574-4e9e-8948-a01fa697ff5f	jester to gain +15 SOL	Will jester (jester) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5005	0.4995	19980.41	19980.41	20019.60	20019.60	0.5005	0.4995	20.00	t	f	\N	2025-11-05 02:00:07.292	2025-10-29 02:00:07.295648	0.00	kolscan	general	f
e1564a37-b27e-4380-a2b2-8054ff5ac4e3	4e3a74b0-8dbe-4321-80d2-e40688912822	blixze ♱ to gain +15 SOL	Will blixze ♱ (blixze♱) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.4978	0.5022	20088.20	20088.20	19912.18	19912.18	0.4978	0.5022	110.00	t	f	\N	2025-11-05 02:00:07.272	2025-10-29 02:00:07.275933	0.00	kolscan	general	f
0ae16313-0efe-4dd3-bc92-ca8bf2246903	eb49a533-b43c-437e-87bc-1c11bc7e7dd9	mog to gain +15 SOL	Will mog (mog) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.4990	0.5010	20039.37	20039.37	19960.70	19960.70	0.4990	0.5010	160.00	t	f	\N	2025-11-05 02:00:07.303	2025-10-29 02:00:07.305964	0.00	kolscan	general	f
15fef1cb-7d54-4348-9005-4512771e0ba1	8fe511e2-5430-4344-95cd-6067927b808b	Rev to gain +15 SOL	Will Rev (rev) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-11-05 02:00:07.278	2025-10-29 02:00:07.284199	0.00	kolscan	general	f
6e5fd4b5-651b-482b-a6b9-36f7cdf769ba	505dc9bb-d2af-48d2-90c7-652476d5e208	Ethan Prosper to gain +15 SOL	Will Ethan Prosper (ethanprosper) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-11-05 02:00:07.286	2025-10-29 02:00:07.289818	0.00	kolscan	general	f
962fec63-4816-4bbb-9970-3f002fb86e02	1b094c8a-34a0-4e32-85c9-97a3d92fb8fd	Veloce to gain +15 SOL	Will Veloce (veloce) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-11-05 02:00:07.266	2025-10-29 02:00:07.27008	0.00	kolscan	general	f
c4fadc68-4591-44c1-ae46-2b92182aaad6	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan have a better win rate than zhynx on tomorrow's leaderboard?	Win rate comparison: rayan (9/10) vs zhynx (5/0)	pending	10000.00	10000.00	0.4879	0.5121	20490.00	20490.00	19521.72	19521.72	0.4879	0.5121	500.00	t	f	\N	2025-10-30 03:00:00.175	2025-10-29 03:00:00.178463	0.00	winrate_flippening	performance	f
18b3c5bd-541a-4ab9-bb77-a92510f6808a	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	N’o to gain +20 SOL	Will N’o (n’o) achieve a total SOL gain of +20 or more by the end of the week?	pending	10000.00	10000.00	0.5012	0.4988	19951.12	19951.12	20049.00	20049.00	0.5012	0.4988	50.00	t	f	\N	2025-11-05 02:00:07.253	2025-10-29 02:00:07.257373	0.00	kolscan	general	f
0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	e8b3cdff-6c8e-4eeb-9a4b-b1e7f0bec093	Will Pain reach rank #14 or better by tomorrow?	Pain is currently #17. Can they climb to #14 or higher?	pending	10000.00	10000.00	0.5051	0.4949	19796.29	19796.29	20205.80	20205.80	0.5051	0.4949	210.00	t	f	\N	2025-10-29 23:16:21.022	2025-10-28 23:16:21.02761	0.00	rank_improvement	ranking	f
af62438b-0dfd-4b7e-921a-c65249b9514b	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo record a win on tomorrow's leaderboard?	Heyitsyolo has 27 wins. Can they add another?	pending	10000.00	10000.00	0.5015	0.4985	19941.37	19941.37	20058.80	20058.80	0.5015	0.4985	60.00	t	f	\N	2025-10-29 23:16:21.342	2025-10-28 23:16:21.347796	0.00	streak_continuation	performance	f
9461bb3d-c43e-445d-b561-8e5a4a9cea87	5f1b471e-824c-4f87-b996-834147d61a66	Will Jeets have a higher win/loss ratio than iconXBT on tomorrow's leaderboard?	Win/Loss ratio comparison: Jeets has 1.83 (11/6) vs iconXBT with 1.76 (30/17)	pending	10000.00	10000.00	0.4996	0.5004	20015.75	20015.75	19984.26	19984.26	0.4996	0.5004	1220.00	t	f	\N	2025-10-29 23:16:18.123	2025-10-28 23:16:18.128571	0.00	winloss_ratio_flippening	performance	f
e6ce6e2c-77ed-4fd4-9687-23b604290619	5d15d55f-1f0e-4757-b774-cb24606f1757	Will kitty rank higher than Cented on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of kitty (currently #20) vs Cented (currently #9)	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	208.00	t	f	\N	2025-10-29 23:16:29.018	2025-10-28 23:16:29.023023	0.00	rank_flippening	ranking	f
12234807-e884-47ca-bf2c-e96e2d3ab1b4	8dde432d-15ac-421a-b758-82f772df4b0d	clukz to gain +25 SOL	Will clukz (clukz) achieve a total SOL gain of +25 or more by the end of the week?	pending	10000.00	10000.00	0.5002	0.4998	19990.20	19990.20	20009.80	20009.80	0.5002	0.4998	10.00	t	f	\N	2025-11-05 02:00:07.247	2025-10-29 02:00:07.251306	0.00	kolscan	general	f
621f98b0-89ea-49de-8d53-e80a7df36042	fe853fd3-8ea4-4a84-a12d-5004e40ec4c1	Will h14 have higher SOL gains than Gake on tomorrow's leaderboard?	SOL gain comparison: +30.34 vs +32.57	pending	10000.00	10000.00	0.5027	0.4973	19892.78	19892.78	20107.80	20107.80	0.5027	0.4973	308.00	t	f	\N	2025-10-29 23:16:17.796	2025-10-28 23:16:17.801933	0.00	sol_gain_flippening	performance	f
6ad998bf-c856-4322-b735-037e8904d055	a5e16c37-a634-4ce3-a3fc-57f972fd10fc	Will ozark have a higher win/loss ratio than Jidn on tomorrow's leaderboard?	Win/Loss ratio comparison: ozark has 55.60 (556/10) vs Jidn with 1.50 (6/4)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	15586.92	20000.00	4413.08	0.7793	0.2207	0.00	t	f	\N	2025-10-30 03:00:00.518	2025-10-29 03:00:00.522878	0.00	winloss_ratio_flippening	performance	f
5fe1c164-bb06-4fa8-8ad3-a06abc6abb15	8fe511e2-5430-4344-95cd-6067927b808b	Will Rev gain +50 SOL or more by tomorrow?	Rev currently has +12.99 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	7117.60	20000.00	12882.40	0.3559	0.6441	0.00	t	f	\N	2025-10-30 03:00:00.539	2025-10-29 03:00:00.544952	0.00	sol_gain_threshold	performance	f
ae59057f-cbc0-4ee4-b623-257f78296ba4	d326149d-4af5-4621-bb59-f4df85ea7605	Will rayan rank higher than Pandora on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of rayan (currently #6) vs Pandora (currently #19)	pending	10000.00	10000.00	0.4884	0.5116	20470.41	20470.41	19540.39	19540.39	0.4884	0.5116	520.00	t	f	\N	2025-10-29 23:16:27.417	2025-10-28 23:16:27.422019	0.00	rank_flippening	ranking	f
1c586da6-67a5-4fde-bd90-c91e90daf7f9	777c18d9-8612-4d2b-9b7e-0cf8e1bd2c4f	Will iconXBT have a positive USD Gain on tomorrow's leaderboard?	Prediction market for iconXBT's profitability streak. Currently: 6721.1	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:00.87	2025-10-29 03:00:00.876781	0.00	profit_streak	performance	f
309c1d8d-9977-4581-ba55-edd92c290a02	ef784796-f1d8-459b-97c0-2a1b9dea02c1	Will Heyitsyolo record a win on tomorrow's leaderboard?	Heyitsyolo has 27 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:01.196	2025-10-29 03:00:01.200803	0.00	streak_continuation	performance	f
063bc602-3bdb-433a-99fc-48cd7907b585	8bc0832a-a821-4ef9-b714-12c4724ac0c1	Will Trenchman reach rank #10 or better by tomorrow?	Trenchman is currently #20. Can they climb to #10 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	t	f	\N	2025-10-30 03:00:01.519	2025-10-29 03:00:01.524944	0.00	rank_improvement	ranking	f
ec85d862-f940-4da4-9d71-ef91ac09766b	613a324c-091b-4948-a69b-5144b04bb933	Will West maintain a top 10 rank on tomorrow's leaderboard?	West is currently #2. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	16800.00	20000.00	3200.00	0.8400	0.1600	0.00	t	f	\N	2025-10-30 03:00:01.839	2025-10-29 03:00:01.843086	0.00	top_rank_maintain	ranking	f
c91aa145-33ce-48f4-ad33-9291b0934eb3	3bd6e77f-cc26-4130-a8be-2f16620f87ef	Will Jijo maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	Jijo currently has a 1.54 W/L ratio (20/13). Can they stay above 1.75?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9153.85	20000.00	10846.15	0.4577	0.5423	0.00	t	f	\N	2025-10-30 03:00:02.16	2025-10-29 03:00:02.16485	0.00	winloss_ratio_maintain	performance	f
c28ccf07-9769-4f65-8a48-3e151084ac97	4e3a74b0-8dbe-4321-80d2-e40688912822	Will blixze ♱ reach rank #5 or better by tomorrow?	blixze ♱ is currently #15. Can they climb to #5 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	t	f	\N	2025-10-30 03:00:02.481	2025-10-29 03:00:02.489962	0.00	rank_improvement	ranking	f
4f0fc05e-cc93-4d5a-94da-1715d59bf30f	505dc9bb-d2af-48d2-90c7-652476d5e208	Will Ethan Prosper gain +50 SOL or more by tomorrow?	Ethan Prosper currently has +12.18 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6923.20	20000.00	13076.80	0.3462	0.6538	0.00	t	f	\N	2025-10-30 03:00:02.805	2025-10-29 03:00:02.808394	0.00	sol_gain_threshold	performance	f
25cc1c7c-5cfd-4b90-8937-22c9b8aaf35e	14422aeb-caa1-44e6-9df0-b33ccb41dd12	Will gr3g record a win on tomorrow's leaderboard?	gr3g has 93 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:03.122	2025-10-29 03:00:03.126426	0.00	streak_continuation	performance	f
d3e89df9-9022-45f0-9fba-73818181fa53	31c67b34-da6a-4223-96e5-bc014f7773d0	Will aloh have a positive USD Gain on tomorrow's leaderboard?	Prediction market for aloh's profitability streak. Currently: 11198.4	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:03.44	2025-10-29 03:00:03.44627	0.00	profit_streak	performance	f
df2d34f2-e289-4b5c-b4ea-1d2bf3baa7ea	28045aed-c22a-400a-af25-af765f640bb8	Will Files maintain a top 10 rank on tomorrow's leaderboard?	Files is currently #3. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	16200.00	20000.00	3800.00	0.8100	0.1900	0.00	t	f	\N	2025-10-30 03:00:03.761	2025-10-29 03:00:03.767525	0.00	top_rank_maintain	ranking	f
4ab9f9b5-6220-4ee6-945f-f642d78c1021	c47d2e86-6f9c-4fe3-b718-715da4f65586	Will big bags bobby maintain a win/loss ratio above 2.00 on tomorrow's leaderboard?	big bags bobby currently has a 2.00 W/L ratio (6/3). Can they stay above 2.00?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:04.084	2025-10-29 03:00:04.088006	0.00	winloss_ratio_maintain	performance	f
e6fb2eb4-3deb-4629-b866-fe113219dd32	fe853fd3-8ea4-4a84-a12d-5004e40ec4c1	Will h14 record a win on tomorrow's leaderboard?	h14 has 8 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:04.404	2025-10-29 03:00:04.410083	0.00	streak_continuation	performance	f
a107783f-e6f7-4653-bc4e-e80e6d298cfa	e478f6e2-c994-40d7-b2c8-6b2bb77bc46f	Will radiance gain +50 SOL or more by tomorrow?	radiance currently has +17.05 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8092.00	20000.00	11908.00	0.4046	0.5954	0.00	t	f	\N	2025-10-30 03:00:04.722	2025-10-29 03:00:04.727279	0.00	sol_gain_threshold	performance	f
91c2d4d9-196d-4df5-acc9-944adc7d0b87	f0d37280-6d2b-4568-bf83-64be010be717	Will BIGWARZ have a positive USD Gain on tomorrow's leaderboard?	Prediction market for BIGWARZ's profitability streak. Currently: 3236.9	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:05.042	2025-10-29 03:00:05.045162	0.00	profit_streak	performance	f
3aa29dfe-c815-4f42-9ebb-fc4bb3d496a6	b9b6965e-b4f9-4e3a-a92f-ba98abe891c6	Will slingoor.usduc maintain a top 10 rank on tomorrow's leaderboard?	slingoor.usduc is currently #2. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	16800.00	20000.00	3200.00	0.8400	0.1600	0.00	t	f	\N	2025-10-30 03:00:05.357	2025-10-29 03:00:05.361118	0.00	top_rank_maintain	ranking	f
60dfe25a-ed36-4b2e-a51e-be83a5b99e7c	a87eb3fb-4574-4e9e-8948-a01fa697ff5f	Will jester maintain a win/loss ratio above 1.75 on tomorrow's leaderboard?	jester currently has a 2.00 W/L ratio (2/1). Can they stay above 1.75?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11000.00	20000.00	9000.00	0.5500	0.4500	0.00	t	f	\N	2025-10-30 03:00:05.678	2025-10-29 03:00:05.68306	0.00	winloss_ratio_maintain	performance	f
1dbc0ce9-9248-4334-8fd6-6821e13a5a8d	a96fc177-ac49-4488-a316-361d14cbed4a	Will para reach rank #14 or better by tomorrow?	para is currently #19. Can they climb to #14 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	t	f	\N	2025-10-30 03:00:05.998	2025-10-29 03:00:06.010568	0.00	rank_improvement	ranking	f
b2ff3162-4651-4d28-8f34-6b20cc8edf56	5f1b471e-824c-4f87-b996-834147d61a66	Will Jeets gain +50 SOL or more by tomorrow?	Jeets currently has +19.34 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8641.60	20000.00	11358.40	0.4321	0.5679	0.00	t	f	\N	2025-10-30 03:00:06.325	2025-10-29 03:00:06.329259	0.00	sol_gain_threshold	performance	f
6a8cc070-067b-4c6d-8835-d33e45e31402	48fd5bc9-7b30-41e8-a7c5-98387139c979	Will Gake record a win on tomorrow's leaderboard?	Gake has 11 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:06.643	2025-10-29 03:00:06.647713	0.00	streak_continuation	performance	f
6d608860-accc-4265-af48-9ee29017d4d2	6600c3d9-36d9-4f78-8d6d-ac0c745d5542	Will Unknown maintain a top 10 rank on tomorrow's leaderboard?	Unknown is currently #9. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	12600.00	20000.00	7400.00	0.6300	0.3700	0.00	t	f	\N	2025-10-30 03:00:06.97	2025-10-29 03:00:06.974688	0.00	top_rank_maintain	ranking	f
96bad048-5b86-4576-b393-efe880fda961	8dde432d-15ac-421a-b758-82f772df4b0d	Will clukz have a positive USD Gain on tomorrow's leaderboard?	Prediction market for clukz's profitability streak. Currently: 4141.8	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:07.288	2025-10-29 03:00:07.291495	0.00	profit_streak	performance	f
a5f1b619-890d-414e-9ceb-e2bd4246aeda	d8629eb3-c067-4dbd-96c1-7857a8ad716f	Will Cooker maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Cooker currently has a 2.60 W/L ratio (13/5). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10400.00	20000.00	9600.00	0.5200	0.4800	0.00	t	f	\N	2025-10-30 03:00:07.605	2025-10-29 03:00:07.608822	0.00	winloss_ratio_maintain	performance	f
4fc6ca97-b059-4a12-bef5-62686601221e	b85b749d-d66f-4a88-89cc-c61cfe123d9c	Will Scharo reach rank #1 or better by tomorrow?	Scharo is currently #11. Can they climb to #1 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	1000.00	20000.00	19000.00	0.0500	0.9500	0.00	t	f	\N	2025-10-30 03:00:07.921	2025-10-29 03:00:07.925256	0.00	rank_improvement	ranking	f
e3884b53-a8be-4fcd-9a70-34b4554b54cc	2401af33-61c9-443b-9e2f-c4f8a312792e	Will WaiterG have a positive USD Gain on tomorrow's leaderboard?	Prediction market for WaiterG's profitability streak. Currently: 16616.3	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:08.242	2025-10-29 03:00:08.246543	0.00	profit_streak	performance	f
d29e0e33-e8b9-4620-b35d-54e3beff7cca	e8b3cdff-6c8e-4eeb-9a4b-b1e7f0bec093	Will Pain reach rank #14 or better by tomorrow?	Pain is currently #17. Can they climb to #14 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9200.00	20000.00	10800.00	0.4600	0.5400	0.00	t	f	\N	2025-10-30 03:00:08.567	2025-10-29 03:00:08.571578	0.00	rank_improvement	ranking	f
4a9038dd-3399-49d8-9670-2ef425d434cc	6225736b-d70a-4635-a9e2-83fd3d045ffe	Will Inside Calls record a win on tomorrow's leaderboard?	Inside Calls has 5 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:08.886	2025-10-29 03:00:08.891016	0.00	streak_continuation	performance	f
7865a002-88d2-4036-95b8-543dc3e51676	b47af344-5e6c-4e67-81e4-b4bd28a5c78e	Will Kadenox gain +50 SOL or more by tomorrow?	Kadenox currently has +14.99 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	7597.60	20000.00	12402.40	0.3799	0.6201	0.00	t	f	\N	2025-10-30 03:00:09.202	2025-10-29 03:00:09.205259	0.00	sol_gain_threshold	performance	f
636fa872-ac41-4f62-986c-ae6f03e65be0	6a2a833b-9f09-4589-9f2a-7dba1743f31f	Will waste management maintain a top 10 rank on tomorrow's leaderboard?	waste management is currently #10. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	12000.00	20000.00	8000.00	0.6000	0.4000	0.00	t	f	\N	2025-10-30 03:00:09.521	2025-10-29 03:00:09.525465	0.00	top_rank_maintain	ranking	f
493ac96b-d610-4e01-8aa4-9074b1c3149f	5c60ab37-5764-4fe6-9ed2-ad7c4c3528a0	Will Kev maintain a win/loss ratio above 2.50 on tomorrow's leaderboard?	Kev currently has a 2.96 W/L ratio (243/82). Can they stay above 2.50?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	11853.66	20000.00	8146.34	0.5927	0.4073	0.00	t	f	\N	2025-10-30 03:00:09.84	2025-10-29 03:00:09.84648	0.00	winloss_ratio_maintain	performance	f
1bd088b0-4fb0-4ebc-ad43-368df3c8b354	333046b1-5768-4cd5-8e8e-b160f88a1146	Will lucas gain +50 SOL or more by tomorrow?	lucas currently has +18.94 SOL gain. Can they reach +50 SOL or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	8545.60	20000.00	11454.40	0.4273	0.5727	0.00	t	f	\N	2025-10-30 03:00:10.161	2025-10-29 03:00:10.168664	0.00	sol_gain_threshold	performance	f
bc2a547b-ed40-48ad-b565-3043c4f883c0	bad8bca0-f8c9-4a03-a51e-c3c0bdded754	Will Pandora reach rank #14 or better by tomorrow?	Pandora is currently #19. Can they climb to #14 or higher?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	6000.00	20000.00	14000.00	0.3000	0.7000	0.00	t	f	\N	2025-10-30 03:00:10.484	2025-10-29 03:00:10.487912	0.00	rank_improvement	ranking	f
e6298676-26a1-4903-8775-9006aea4ea8b	a5e6953c-e3ae-43af-a9ed-05e0aa47e252	Will Beaver record a win on tomorrow's leaderboard?	Beaver has 16 wins. Can they add another?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10000.00	20000.00	10000.00	0.5000	0.5000	0.00	t	f	\N	2025-10-30 03:00:10.801	2025-10-29 03:00:10.804778	0.00	streak_continuation	performance	f
21a270ff-00ae-493a-876d-1f43ad2a7056	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Will Cented have a positive USD Gain on tomorrow's leaderboard?	Prediction market for Cented's profitability streak. Currently: 2838.4	pending	10000.00	10000.00	0.5000	0.5000	20000.00	13000.00	20000.00	7000.00	0.6500	0.3500	0.00	t	f	\N	2025-10-30 03:00:11.117	2025-10-29 03:00:11.121199	0.00	profit_streak	performance	f
78e03e8c-fd59-4507-8ff7-03d6f47e3a72	0f08bb54-8367-46f1-b980-a98e935778c4	Will Danny maintain a top 10 rank on tomorrow's leaderboard?	Danny is currently #3. Can they stay in the top 10?	pending	10000.00	10000.00	0.5000	0.5000	20000.00	16200.00	20000.00	3800.00	0.8100	0.1900	0.00	t	f	\N	2025-10-30 03:00:11.434	2025-10-29 03:00:11.43793	0.00	top_rank_maintain	ranking	f
4e94ac6f-e124-4a7a-b061-9949d8d55545	9fa0e441-736e-4f11-aa7d-63ffe2688f3e	Will Letterbomb rank higher than mog on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Letterbomb (currently #14) vs mog (currently #20)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10600.00	20000.00	9400.00	0.5300	0.4700	0.00	t	f	\N	2025-10-30 03:00:11.752	2025-10-29 03:00:11.757067	0.00	rank_flippening	ranking	f
21e73362-e364-4519-b292-a8f242ed54ca	27a9a979-ed73-4fb4-ba2b-ea09ffbb7886	Will N’o rank higher than dv on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of N’o (currently #11) vs dv (currently #15)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10400.00	20000.00	9600.00	0.5200	0.4800	0.00	t	f	\N	2025-10-30 03:00:12.073	2025-10-29 03:00:12.076595	0.00	rank_flippening	ranking	f
e2bba550-fe26-412d-8cbe-fdb6dc1e8ac3	00a0edb8-f329-458e-9ead-36904162e7da	Will oscar rank higher than Little Mustacho 🐕 on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of oscar (currently #18) vs Little Mustacho 🐕 (currently #8)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	9000.00	20000.00	11000.00	0.4500	0.5500	0.00	t	f	\N	2025-10-30 03:00:12.389	2025-10-29 03:00:12.393506	0.00	rank_flippening	ranking	f
d600c750-f09c-4664-aa25-b324e74f26fb	1b094c8a-34a0-4e32-85c9-97a3d92fb8fd	Will Veloce rank higher than kitty on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Veloce (currently #14) vs kitty (currently #20)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10600.00	20000.00	9400.00	0.5300	0.4700	0.00	t	f	\N	2025-10-30 03:00:12.706	2025-10-29 03:00:12.710801	0.00	rank_flippening	ranking	f
2de774f9-648d-4b44-a0fe-72e6850fb653	de488477-23b8-484d-90fa-59e29f4e26c5	Will M A M B A 🧲 rank higher than Publix on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of M A M B A 🧲 (currently #7) vs Publix (currently #13)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10600.00	20000.00	9400.00	0.5300	0.4700	0.00	t	f	\N	2025-10-30 03:00:13.025	2025-10-29 03:00:13.030986	0.00	rank_flippening	ranking	f
5f832d26-3f40-4b1f-a806-c72ef9032d2b	55bbf3e2-9acd-4d86-9368-ab41f801b19c	Will Sheep rank higher than Ban on tomorrow's kolscan.io leaderboard?	Prediction market comparing ranks of Sheep (currently #12) vs Ban (currently #19)	pending	10000.00	10000.00	0.5000	0.5000	20000.00	10700.00	20000.00	9300.00	0.5350	0.4650	0.00	t	f	\N	2025-10-30 03:00:13.347	2025-10-29 03:00:13.35158	0.00	rank_flippening	ranking	f
7a6658de-1c31-445c-90e0-370fc3977773	e6667556-2e70-495e-9a0f-68ec54d7b5f4	Cented to gain +15 SOL	Will Cented (cented) achieve a total SOL gain of +15 or more by the end of the week?	pending	10000.00	10000.00	0.5133	0.4867	19475.15	19475.15	20539.00	20539.00	0.5133	0.4867	550.00	t	f	\N	2025-11-05 02:00:07.26	2025-10-29 02:00:07.263786	0.00	kolscan	general	f
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, sender_id, content, read, created_at) FROM stdin;
60753671-fe95-4a4c-81df-65a7185b0122	f1927021-9d4b-491a-9b59-e30726e80d52	af68e352-8fe4-41f7-bae1-e6fe20d5dbb2	yo	t	2025-10-29 13:23:02.962159
230def42-fa64-4c3d-9e49-b253b1070d47	745c2be1-4fd4-4d43-8943-7ffb8d32d5b2	3a5ef17d-4776-4607-9577-75f70d4027e4	Wassup gang	f	2025-10-29 20:11:39.498689
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, type, title, message, data, read, created_at) FROM stdin;
392d2bd4-57d5-400b-8be0-c5b860273deb	2a5a8384-d652-42e3-bed1-b03545d35725	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-27 00:50:42.141772
fea2f469-7b33-4699-90c7-1a931b2bf636	2a5a8384-d652-42e3-bed1-b03545d35725	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-27 02:07:46.429583
2d6d029d-0a62-4295-bde1-febc24be798d	2a5a8384-d652-42e3-bed1-b03545d35725	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-27 02:07:46.53966
0fcfd6d0-8f1e-4d7e-a8f7-d7945d629513	2a5a8384-d652-42e3-bed1-b03545d35725	new_follower	New Follower	ant started following you	{"followerId":"a609b100-e7e3-4c8f-9f00-11dbde40d6f0"}	f	2025-10-27 15:48:03.367262
efade994-f79a-4073-9bf2-a6a5d6dec4a7	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-27 15:49:34.035315
4b3d6edd-09cc-4612-8c73-06239c22c56a	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-27 15:56:24.274725
fe4be3d2-5cdc-4a60-a415-1a1ec491da6b	72e306d2-207c-462c-9415-a0c7aa96a2ab	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-27 16:26:30.706113
39137860-3b8f-44db-9482-3989d2eb2449	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-27 16:26:46.400115
439c4b23-fe46-4bf5-95c6-0dc4bec63fa1	72e306d2-207c-462c-9415-a0c7aa96a2ab	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-27 16:27:04.567069
278085d4-abb5-4d86-bfa7-bff587e5d0dd	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-27 16:27:29.893739
56bbb339-5424-4607-8f95-cd0baf475689	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-27 16:27:37.709817
68f0ebb6-9394-47b4-baf4-361a32085b46	9834faee-2e62-43c4-8bdf-e8a48c024bd0	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:13:26.40233
a6bcb5ac-1019-4221-a936-71203951c359	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:14:17.236393
b8cfe3e2-f74e-4d28-839b-ddff47329285	d8c125df-fb1f-4755-9975-1e23ffdd006a	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:15:27.737414
b2e1b40f-49ca-42cc-aa67-a7cdab15737e	8903720d-1010-4477-a548-0fa98558c462	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:31:21.640135
9dba05b7-fda5-429e-986d-76c2b64e0328	2cebf2a9-8cd9-41e2-8a76-357570839646	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:32:42.208781
744469e3-aa72-48a4-8839-9560e3bbd194	c694679a-47f2-416e-8e5f-34735fba5715	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:43:09.082977
3f290a49-390d-440a-b7f7-2f4495807790	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:45:04.903686
4663b11f-9b3e-4b95-b86e-8892c738d0ec	47887516-721e-4369-9fb0-918c63bb8227	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:52:13.982965
064a3e71-7234-40a6-8272-6645ba060ea9	4a6a595c-f247-4f53-a589-e606cc428bc1	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:56:47.454423
6a7136ec-55b6-4952-8651-4995cc980d27	769a0aa2-9ce2-4a09-8efb-697727a78239	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 00:59:34.526754
c91441a4-64fb-4b2b-9992-5dc98f640e41	088deaa4-8a69-4d01-ac4c-a00a67444efc	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:05:47.360551
cc8d66e6-f9da-4703-8c63-6e852b9509d7	30505fa7-dbbb-45c9-b704-5498b6ce730d	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:12:22.212117
13c9bae8-1c88-4359-a77d-0d7e49e6eb21	01289b67-bc83-469e-99a1-356102efe0fd	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:17:16.378871
307c4488-ff4a-47d8-84a7-42363d2d9327	ce45f9ea-0146-431f-9469-15e31de21981	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:37:15.963516
d4f00039-3afa-4aa2-a2f2-b19c4cbd2694	aec40e30-e922-4f47-8552-c07c08a12e9a	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:37:23.315734
a4549ddb-2841-4171-9df1-54556b346d55	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:38:38.802121
2e78855d-e3e6-477e-a393-0320724947fa	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 01:38:53.647475
4c5147c5-fa0b-453b-9676-0651944f7de9	b03668e6-821a-4e06-b541-1cd2e0ea45af	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:41:46.367002
b0b5e951-0992-4a65-bb36-525031118f49	7f0a9138-5a4d-4955-8895-dc27436f10b2	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:44:09.212523
06a4e32b-7226-4153-b4d2-fb8d56e034f5	00772767-41bc-4967-8266-5541d53b105e	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:47:44.880553
591d28ec-09b1-41f3-815e-583beaccdc02	00772767-41bc-4967-8266-5541d53b105e	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 01:47:44.904341
9fd16521-79a5-46fe-ae85-2b1b8b3c40dd	0238327d-15b3-41ae-b52c-cf223ee9832c	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:48:29.880678
52c85802-e3ed-4a63-a3ea-1bcbea7087af	0238327d-15b3-41ae-b52c-cf223ee9832c	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-29 01:51:21.36499
724345ae-e7ac-4929-96c2-d7b805f97389	c37781bb-d03a-4b8f-aa8b-972ee268014a	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:56:01.493932
4f012042-4ff3-409a-b84c-2e9df3fa1815	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:28:20.708495
2c15785d-7d3a-4a68-a0e5-9dbbe4ce5478	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:31:48.06631
1ea40c21-54a1-4f84-bb50-ac1cdfb1fd43	bdefc13e-f3e5-49a2-b749-4aa864027d42	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:48:49.179857
032d7f3f-2092-41c3-ae90-a652559ac992	411dc4b0-c7f6-44ba-a7cd-dab215760984	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:12:46.506225
ea0b1bf7-48f8-47ec-99c4-ddbab2156195	d6f78f80-b222-49b8-9412-eea692bcaa34	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:17:37.671001
111aea46-24f2-40f4-8edc-90ee3085b3ac	0238327d-15b3-41ae-b52c-cf223ee9832c	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 01:49:21.098238
454ff6d6-83a4-4d45-b881-9a2a52e91408	5cdda325-1f54-42bc-b1d1-7479913fc3f5	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:51:48.255244
097ba116-5441-4798-9633-eae876657d76	898e8852-e40d-4b2a-a8f7-3e215268febc	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 01:57:52.741709
c4dfd133-2b51-4e81-b783-e4576fd937ca	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:04:20.855634
2a678c7e-fc35-4d25-9025-e4aa40c1f024	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:15:40.481336
ce4fbe55-82a1-49b1-a966-c5382a214966	d6f78f80-b222-49b8-9412-eea692bcaa34	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 02:18:38.435308
b2221ab5-d3ce-4e64-bea9-6b1a5f2c9989	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:30:39.893058
59f542fc-bb21-45de-9616-3959f37bec95	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-29 02:38:37.962531
375c0242-37bb-4529-8844-8b2dab3b52ec	d3e4a456-7bbd-461c-8806-50dee853d118	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:31:20.808034
e878a61e-bf35-448d-8a43-d88630692df0	37ed79db-51d0-4907-aa94-75502fa74c5e	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:32:52.792742
4037a84a-7b28-4913-a6ad-aa7492083744	e5275105-2102-4d2c-afda-0440b7afaab3	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:38:33.777555
d936919b-a1b6-485b-b6c5-bc189de90c9f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	achievement_earned	Achievement Unlocked!	You earned the "High Roller" achievement: Place 50 bets	{"achievementId":"2cdf8eb5-05c8-4d14-935d-a30ed92a38ae"}	f	2025-10-29 02:42:50.015825
b2f92798-dfa6-4f69-b876-78d8ce279f7c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	achievement_earned	Achievement Unlocked!	You earned the "High Roller" achievement: Place 50 bets	{"achievementId":"2cdf8eb5-05c8-4d14-935d-a30ed92a38ae"}	f	2025-10-29 02:42:50.380909
1d62ef20-7a7a-4869-badf-5242e218cf53	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	achievement_earned	Achievement Unlocked!	You earned the "High Roller" achievement: Place 50 bets	{"achievementId":"2cdf8eb5-05c8-4d14-935d-a30ed92a38ae"}	f	2025-10-29 02:42:52.866088
51745e9f-a409-4906-85a8-b4b2ca530371	116eace9-841b-48fa-a7ec-d3249bb3aa80	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:43:30.9188
701f2ebc-7e07-49d1-be04-fa91aeb8f554	e5275105-2102-4d2c-afda-0440b7afaab3	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-29 02:45:08.070636
4cbcbae6-3253-4b8e-9919-2e9cce7e1057	e5275105-2102-4d2c-afda-0440b7afaab3	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 02:45:22.709225
ab9a809c-ce6c-4b11-b6f1-0c5d7129cebf	7c7bb616-dc44-412d-b05f-2c34fc58929b	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:46:24.715925
3a7540df-4d5d-47b5-b6c6-87412602a475	781a2101-8dfc-480e-a185-69fab61df3cc	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:48:37.471137
080d422f-c998-459f-901d-8526ece37ab0	7c7bb616-dc44-412d-b05f-2c34fc58929b	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 02:48:52.670468
79dd932a-aaea-4017-91f5-03caa6b7781b	781a2101-8dfc-480e-a185-69fab61df3cc	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-29 02:49:12.753515
ff7eb7da-4319-44f7-baaf-8b8b73702a75	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:50:55.6743
369ac15f-2b3d-4475-a506-b8278387eef5	116eace9-841b-48fa-a7ec-d3249bb3aa80	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 02:52:45.003516
00bf0add-b895-497c-a5f6-a7e76852e56d	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 02:52:49.341839
b4fe5fd5-5280-4ed4-b258-df10455dd452	781a2101-8dfc-480e-a185-69fab61df3cc	achievement_earned	Achievement Unlocked!	You earned the "High Roller" achievement: Place 50 bets	{"achievementId":"2cdf8eb5-05c8-4d14-935d-a30ed92a38ae"}	f	2025-10-29 02:54:47.596491
85fd3df2-a1c5-4642-a2e9-616b0ab49027	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:56:40.074622
0400ff54-4042-44ca-94f6-1a3eddabf24a	6b9280e2-476c-430b-9470-05ee75118ac6	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 02:58:21.124636
218d8e62-097e-4550-a489-787437f42cd0	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:00:28.394037
39a75efe-d013-4968-87c8-a779d1801387	986f6e58-f06f-4981-a9a6-4d721e24cd15	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:01:09.791096
aff5e2e9-31a9-4b37-ac31-04e95a6f9c75	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	achievement_earned	Achievement Unlocked!	You earned the "Betting Enthusiast" achievement: Place 10 bets	{"achievementId":"6a6f2d9b-14cf-497b-9e46-00b4862ec830"}	f	2025-10-29 03:04:03.664363
68009595-e81d-4410-8f36-0d358be940ca	0630514b-c953-4b9c-bea4-1fbe518040ef	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:07:06.443442
a679d103-6f19-40af-a8d8-6a4ce53e721c	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 03:18:55.187082
df2db24e-5dfa-4633-acba-c989472b39d5	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:27:58.182517
1b6e9b5d-48f8-49c7-b0a3-a6ee6755fa7c	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	new_follower	New Follower	Guest_1761708633284 started following you	{"followerId":"746f0658-f3e6-44f4-bdb8-71345374be68"}	f	2025-10-29 03:32:31.097337
9ee1f5f5-c019-4cb5-9824-3422fcb0b9d8	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708633284 started following you	{"followerId":"746f0658-f3e6-44f4-bdb8-71345374be68"}	f	2025-10-29 03:32:42.983708
6b312b2a-3592-46f3-8ceb-fdcebd03f9bc	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708773219 started following you	{"followerId":"99a56924-6436-455f-812d-56cddc5dd11d"}	f	2025-10-29 03:33:06.769405
00385a90-a2b7-45e1-9e18-155dc4e375f7	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708801287 started following you	{"followerId":"937db43f-f8a7-4267-8642-6f3b7bf7daca"}	f	2025-10-29 03:33:31.880464
a261e45d-5711-48a9-ac6e-c9fdd64a8c29	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708823275 started following you	{"followerId":"26a3a171-3b7e-4f87-b72e-9c8051be3497"}	f	2025-10-29 03:33:53.239889
25d3478f-2896-45f8-8e5b-7f311508cedc	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708840999 started following you	{"followerId":"6f27289a-df8a-460f-bacf-0e17c58639dc"}	f	2025-10-29 03:34:11.823131
7941aa9d-c899-472a-8e40-a18fb492de5a	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708889629 started following you	{"followerId":"fab8990b-6a36-4d52-b34b-312848c2e947"}	f	2025-10-29 03:35:02.188136
0cdf53e1-3ec7-419f-937e-a4989f230674	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:37:52.708123
c32bae06-06da-4969-abc1-c4ee61e4c36c	781a2101-8dfc-480e-a185-69fab61df3cc	new_follower	New Follower	Guest_1761708909666 started following you	{"followerId":"a3e9ed93-9377-4941-81a9-d46e27dd6a00"}	f	2025-10-29 03:35:21.657596
07613102-433e-45fa-8cac-04413b11e902	477a8b79-e143-4a9d-9973-a8cddae67200	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 03:40:10.914542
275aa14d-a2b9-46e5-a1aa-4b80b397ff58	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 04:21:08.095909
38c1cbd1-f476-4ccf-844e-6f2cf7748391	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 05:20:24.71921
4c548f77-ece8-4595-aeaf-4189099e4504	bd56d08d-5742-46cd-bc48-fb65d8d58111	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 05:46:05.413247
3aa98070-030d-4ca0-9cde-24d609c89466	97c3ead3-ae64-4a29-89da-5d5006dcbf43	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 05:51:40.871323
0222ab8e-4689-47d0-a4f0-422c7a047c63	f166a726-47ab-404b-9555-16a114a5cb89	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 07:31:19.152375
830bbf5b-dc86-4fae-af95-8efe37fdf5e2	4cfa95be-699c-4019-b7e7-873475ad0fc5	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 08:23:11.78906
8e850f17-2541-464c-b02d-91b6905e9c2f	23144889-a854-43a5-ada7-d9cb5abc31f0	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 09:03:44.109395
d001aa3d-4c70-4a61-9b7c-da41cb8d886b	a85fd10a-3ea5-4f11-9740-799d19224b70	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 10:06:38.13295
35628fce-a646-4501-8b0f-4772d1e12e4a	ae6cf106-8d94-4ca6-9e85-8165196a9011	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 10:33:06.317857
c7d56db1-eb2c-463a-9427-0c0d2a989d92	9e1c1b26-c03b-4319-9e39-e477f314e814	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 11:12:42.043446
369e6386-b76b-41ee-bf16-25272b453a76	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 11:14:00.306024
8b09b8a9-28ff-4428-a225-45c19810e5c5	6f37eec8-c479-419d-bc02-5dc6064b7e2e	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 11:29:06.111675
d7b83c5e-a7c9-40ad-af7b-ead33971ce2a	9095d825-361c-47f5-a10d-1aa6f559f7f5	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 11:45:04.886663
6fee2fcc-c164-4def-8b5f-2ffe3e092d15	32735788-8647-4ccc-9ecb-54f45a69e878	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 13:41:02.819743
df7a22ab-6b2f-43fb-9978-bb956e4f8d5b	64b0f2e4-508c-4efa-8b39-0b3569451567	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 15:08:57.689417
672a00b1-8f31-4567-8ecf-9aa6875773e8	5f8d475c-cbf4-4590-93f9-490db5f1eb48	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 15:43:46.958886
3caf36a5-5ff5-4d0e-84dd-5f109b822b08	9e1c1b26-c03b-4319-9e39-e477f314e814	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 15:59:36.958755
8ed4549b-5a8a-47f9-ae48-72f233a98653	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 16:03:51.889133
47ab22c3-4478-4810-8c37-1dae52e7f445	74923495-465e-44cc-9609-5c8a1ed982ba	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 17:18:26.98746
019a165b-84b5-439f-a3f0-85d64dcc803a	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 18:24:56.13059
1b999e71-8e46-4206-b479-7b6bed2403bf	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 18:36:00.158103
2da81ae7-560f-4fe1-99ff-6c670b878f1d	df9311d2-24d6-4018-9afb-e9d114f142c2	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 19:00:28.116958
3d788580-fba0-44c5-ab4b-2f54a0d6f3b2	27432bf0-e96a-4136-88ed-fe24815881e6	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 20:03:56.694704
6ecacf08-cbda-4c95-9a6b-970c442bc8c0	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 21:02:59.913683
428db353-0cc5-4562-b8a5-d7ad6f8de854	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	achievement_earned	Achievement Unlocked!	You earned the "Volume Trader" achievement: Trade 1000 PTS total volume	{"achievementId":"27609639-747f-44b0-a043-6397c0e5779f"}	f	2025-10-29 21:06:16.610691
76719921-226c-417c-86da-c3aa1f4c2568	78692077-9972-4fc9-9757-92e393af4830	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 21:24:13.996989
1dd52920-115f-47aa-bec3-0ebc198c8557	8c3fd324-9419-40fc-ab4d-22229b75b911	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 21:28:43.408772
bf5ada12-00a7-4eb2-86af-2e6c260e6beb	e373c930-5e25-404b-a36b-0faf910436a3	achievement_earned	Achievement Unlocked!	You earned the "First Bet" achievement: Place your first bet on any market	{"achievementId":"3eeaa658-3719-4a3a-baa2-5fe636e28a9c"}	f	2025-10-29 21:49:10.378702
\.


--
-- Data for Name: platform_fees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.platform_fees (id, bet_id, user_id, amount, fee_percentage, created_at) FROM stdin;
ada97697-2736-4ce5-a9e7-7147fc725674	164f4263-60e8-480c-984e-53a375ae52ed	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 00:50:41.722347
84b78d0c-0eab-45b3-bed5-358eed3820c2	09fcdeef-84aa-452e-b3fd-5a6638e400b4	2a5a8384-d652-42e3-bed1-b03545d35725	10.000000000	2.00	2025-10-27 02:06:53.043818
bad39cae-720b-46ee-a932-6ef9220d4a8e	cf2ed0f4-f81d-4487-9ee1-d63750097392	2a5a8384-d652-42e3-bed1-b03545d35725	2.000000000	2.00	2025-10-27 02:07:01.735365
07c27d03-6dd7-4b3b-8893-6bf4bc410396	d66a0757-5960-4b2f-a643-403475966ed5	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:06.25889
bc33afb0-f248-467a-a5c1-00b1e2766750	7e6f1432-a52d-42b6-897e-875087d8eab7	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:11.237134
9199455d-d015-409a-8971-e7c6373f8b5f	51e020b0-ce33-4199-9393-d36ab4f47c09	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:15.236204
5d432af9-8107-43d2-a31e-370dac578c7e	0a90ef78-1da2-472a-8163-bfc6d3250f7e	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:22.007349
1a8ee558-97dd-448f-bd29-d5deb6369e11	7bd99def-ba95-404b-897a-c1ef54ff9539	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:31.348822
6fa52bfa-c00b-424d-8fb2-716937b80715	8ea9f723-1cb2-4291-864a-4bd2d92f873f	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:37.536118
d3dcbddf-9fe2-4c3a-83fd-ec1f87338e24	13e13539-49e5-48a6-b0f7-aa7a1ce35d82	2a5a8384-d652-42e3-bed1-b03545d35725	1.000000000	2.00	2025-10-27 02:07:46.041975
a902a7f8-5f57-4875-88ae-8c58a2acf364	7293a639-9b2c-4ec1-a07a-754797540ad4	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	10.000000000	2.00	2025-10-27 15:49:33.474765
a66077a7-b3bc-4c22-a458-dba58692fa87	74d28bc2-315b-45d4-9a50-c2a63f252893	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	10.000000000	2.00	2025-10-27 15:56:23.733394
38d4a3b3-b244-4165-91fb-ab45f38fe7b4	ae0a109f-ef73-4b1b-8129-13c5760001ca	72e306d2-207c-462c-9415-a0c7aa96a2ab	10.000000000	2.00	2025-10-27 16:26:30.19125
171a7819-b19d-4976-a230-6f4970d24951	4c774a50-8a22-43cb-8d29-2cd9509af935	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	2.000000000	2.00	2025-10-27 16:26:45.713959
9feb09e8-57b4-4937-9846-e75c6d60a248	8736a822-592d-4cfb-a3ab-b0cf6da03ccc	72e306d2-207c-462c-9415-a0c7aa96a2ab	10.000000000	2.00	2025-10-27 16:27:03.829359
7afe5a9f-f117-4ff0-94bb-908dd5e07a82	14ecf6d9-6e06-4f5c-9da7-8d8a73a7d7fd	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	10.000000000	2.00	2025-10-27 16:27:29.312988
30e76ae5-1964-4ca7-ba6c-9af2e33f68f2	bb068e2a-968c-486f-98d2-450c12d1e615	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	10.000000000	2.00	2025-10-27 16:27:37.05216
da60f0c2-5cf2-4086-9a7a-8af7bf85c6ec	4183c641-1193-476c-a1cc-7320f9ac26aa	9834faee-2e62-43c4-8bdf-e8a48c024bd0	2.000000000	2.00	2025-10-29 00:13:26.274596
7260ba67-8bd9-41d5-95c6-862f28109b51	f93336c0-2606-4a34-b905-f64a7d20de31	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	2.000000000	2.00	2025-10-29 00:14:17.125869
80409fca-6979-4f8d-99a5-994fac61d103	76e41b06-001a-410b-9472-591df2d43e30	d8c125df-fb1f-4755-9975-1e23ffdd006a	0.200000000	2.00	2025-10-29 00:15:27.628916
9bbc8d88-67fe-40a7-99cc-272f1e61cdb8	7db9054d-57f0-4a05-883e-36af38cf54f3	8903720d-1010-4477-a548-0fa98558c462	1.000000000	2.00	2025-10-29 00:31:21.550961
e4280faf-f0f7-487e-9a61-4a3b3e9a49bb	9f3dae7d-2b63-4e33-9b9c-381fbe797f53	8903720d-1010-4477-a548-0fa98558c462	2.000000000	2.00	2025-10-29 00:31:45.16686
51230922-a74b-4596-9364-849ca4bedd64	cf689ca2-23d1-473c-ad8b-e3b4a3710ff2	2cebf2a9-8cd9-41e2-8a76-357570839646	0.200000000	2.00	2025-10-29 00:32:42.119324
2057d149-80e0-4bb8-b3f8-957f013461b9	d5e851c4-3a8e-4a3c-b3cf-ddcb539edff3	8903720d-1010-4477-a548-0fa98558c462	2.000000000	2.00	2025-10-29 00:32:43.583584
0616b732-9414-4ab6-89ef-06fad69677e4	184e7eee-7f33-4a51-a4af-98291b48e049	8903720d-1010-4477-a548-0fa98558c462	1.000000000	2.00	2025-10-29 00:33:18.874206
16430f9b-0376-4e3c-888e-110f7457e3dd	45f2874b-6e47-42e0-8e1f-972dcee52b19	8903720d-1010-4477-a548-0fa98558c462	1.000000000	2.00	2025-10-29 00:33:27.801152
2ea54f75-1040-4008-9ee4-a7ea5fce7c2d	66130f1f-0013-4b4d-a4e6-4c78a970c350	8903720d-1010-4477-a548-0fa98558c462	2.000000000	2.00	2025-10-29 00:33:42.31956
63f06b29-d8db-4f47-bb5d-47e69058e117	02dfabd4-1f21-468b-9ef2-466d4db9d4f1	8903720d-1010-4477-a548-0fa98558c462	1.000000000	2.00	2025-10-29 00:36:51.629264
dddd18a9-da5e-464e-9345-80578a9ab5c0	30e7eddd-479d-4efe-bba0-0b2cfd510783	8903720d-1010-4477-a548-0fa98558c462	2.000000000	2.00	2025-10-29 00:37:07.213039
5ff8ecc3-00f1-46f5-8c07-8fffbf0b3b01	468e49c8-36f6-40b6-b014-7cf729ad66c1	c694679a-47f2-416e-8e5f-34735fba5715	0.200000000	2.00	2025-10-29 00:43:08.966572
e1d63a6a-47eb-47b6-8636-379df9497b9c	0df957cf-b0f9-4f8e-89a6-970dee892014	c694679a-47f2-416e-8e5f-34735fba5715	0.200000000	2.00	2025-10-29 00:43:40.574957
71b140bb-4ea8-4ae6-902a-556149d5245c	e5ff9495-d210-437b-8527-084c4b892843	c694679a-47f2-416e-8e5f-34735fba5715	10.000000000	2.00	2025-10-29 00:43:51.413699
655729a4-44da-483a-8cd2-44c7432ee2b1	982df626-cc04-4f81-87af-969aa9c1c250	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	1.000000000	2.00	2025-10-29 00:45:04.803493
4c391eaa-bf40-403c-a764-224b0e188b15	21c10581-7a74-4ca8-91ee-5dae7c0b5612	47887516-721e-4369-9fb0-918c63bb8227	19.980000000	2.00	2025-10-29 00:52:13.88472
bc0683f0-ef17-4a16-b6de-4307c02499ea	9a0b792b-3208-40fa-be4d-e8b6a4a73f5d	4a6a595c-f247-4f53-a589-e606cc428bc1	2.000000000	2.00	2025-10-29 00:56:47.384946
241877d9-1b33-42fc-8d25-4121048b00c5	d5f3bdb5-ce9d-43ff-a82e-df5f339edd45	769a0aa2-9ce2-4a09-8efb-697727a78239	0.200000000	2.00	2025-10-29 00:59:34.444556
c153e4db-6b38-45b9-85ed-74f5da0c19af	5a2cde4b-e988-4d4d-a110-b5cc8d39d39b	4a6a595c-f247-4f53-a589-e606cc428bc1	10.000000000	2.00	2025-10-29 01:04:16.062373
5b316881-355f-4b0d-a586-d0f879a7aca6	2ab1a2cb-dace-4947-8aa7-26f6684fc89e	088deaa4-8a69-4d01-ac4c-a00a67444efc	1.000000000	2.00	2025-10-29 01:05:47.252577
60e61edc-c94e-4ec4-8018-b066ee742dc8	77f2da9b-9eeb-410b-a966-8f8b7528e784	30505fa7-dbbb-45c9-b704-5498b6ce730d	0.200000000	2.00	2025-10-29 01:12:22.113134
8abb0076-a905-484a-94f7-f93ddcfe0909	ce0b41a6-6bb2-4179-9268-f2bf7dfb1a04	01289b67-bc83-469e-99a1-356102efe0fd	10.000000000	2.00	2025-10-29 01:17:16.311129
ae562e60-d1e3-494a-bec3-a514d06f0566	be08e159-2663-4040-be73-8f132d294aad	ce45f9ea-0146-431f-9469-15e31de21981	0.200000000	2.00	2025-10-29 01:37:15.866343
af11af25-b0ce-490b-a390-c8e04724610f	265a6e8a-874e-459b-8141-c9105d34e9cf	aec40e30-e922-4f47-8552-c07c08a12e9a	0.200000000	2.00	2025-10-29 01:37:23.221561
1f41e253-a542-4533-ae49-944a63008629	a80f4c0e-2855-4cf8-8a28-f93c14c17c25	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	0.200000000	2.00	2025-10-29 01:38:38.69574
42ca9a89-d122-4f01-a40c-47bed2094f8c	e94637d6-62d9-49a4-a067-0312464693f4	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	19.800000000	2.00	2025-10-29 01:38:53.53887
4155df65-8b72-491f-80a5-252d178454da	5ea40eb5-e7c3-4313-b7f5-15b628c6a393	b03668e6-821a-4e06-b541-1cd2e0ea45af	2.000000000	2.00	2025-10-29 01:41:46.173925
ea9fc47c-8651-40b3-b0da-e813e97be988	e6501650-aad9-41af-8900-21983cc84cd9	7f0a9138-5a4d-4955-8895-dc27436f10b2	0.200000000	2.00	2025-10-29 01:44:09.135858
1f59e935-851b-4432-a6bc-00092c30290d	1bc1c10d-73d9-4909-ba53-2b54fc5ff2d1	00772767-41bc-4967-8266-5541d53b105e	20.000000000	2.00	2025-10-29 01:47:44.804567
75a55a67-ac60-45d6-be1a-543137a492d0	3db00ddc-2097-40f0-989f-85aa974ef28a	0238327d-15b3-41ae-b52c-cf223ee9832c	2.000000000	2.00	2025-10-29 01:48:29.78099
3b7c7ade-64d0-4e2f-baee-1f8113bf57ed	24e141a5-3c46-439d-8ede-3cf47feb03eb	0238327d-15b3-41ae-b52c-cf223ee9832c	2.000000000	2.00	2025-10-29 01:48:44.873284
99178397-a215-477c-99bd-1a1253d3f482	9b923e82-d192-48c2-8c91-389505b3900a	bdefc13e-f3e5-49a2-b749-4aa864027d42	0.200000000	2.00	2025-10-29 01:48:48.788353
3fb84d04-73af-40ca-ae28-d8ca54fadb48	4ddab040-2bf0-44ae-b8cf-ba8ddd3258d5	0238327d-15b3-41ae-b52c-cf223ee9832c	10.000000000	2.00	2025-10-29 01:48:54.558174
66b2c256-80d7-433a-aab2-8b41ebf4dc1a	200b93a4-5d1e-429e-a5c1-e8f4855333c4	0238327d-15b3-41ae-b52c-cf223ee9832c	2.000000000	2.00	2025-10-29 01:49:06.944401
84242f82-b7d9-4a69-8bc7-94de24e73118	6bec6ec1-097c-4e54-90de-dafa96a59472	0238327d-15b3-41ae-b52c-cf223ee9832c	2.000000000	2.00	2025-10-29 01:49:14.429885
ded8ad22-574f-4774-beca-6eebfa64c999	f6904d6a-c3bd-4e89-8cff-9c9279c99594	0238327d-15b3-41ae-b52c-cf223ee9832c	2.000000000	2.00	2025-10-29 01:49:20.604877
4deb7e7b-bdfe-4e42-b407-64cf62955594	7d58709f-3dd5-4684-9e79-0feb39144791	5cdda325-1f54-42bc-b1d1-7479913fc3f5	2.000000000	2.00	2025-10-29 01:51:48.152298
e76fc3b7-217e-4861-bd83-38038030a748	580944f6-07c8-4961-b217-370f5ffee905	0238327d-15b3-41ae-b52c-cf223ee9832c	17.640000000	2.00	2025-10-29 01:52:04.206533
4f3bcfa6-a358-4d22-a054-e6d0b9899001	48eae729-dd9c-4bd5-8552-7bc8477cacc4	0238327d-15b3-41ae-b52c-cf223ee9832c	1.960000000	2.00	2025-10-29 01:52:39.076722
3345e3d8-3fc2-485c-98c9-8ed123da48a6	5729296b-81fb-4de5-a697-eb445ddf4943	c37781bb-d03a-4b8f-aa8b-972ee268014a	1.000000000	2.00	2025-10-29 01:56:01.419563
b17ece9d-d998-4446-b9bf-aeaaeed10404	42299002-f4e6-4165-afe0-eece4255e5f7	c37781bb-d03a-4b8f-aa8b-972ee268014a	2.000000000	2.00	2025-10-29 01:56:21.762771
d7661318-39af-46cf-8933-1633b1ef824a	aececbe4-4255-42ce-917e-6e63500ca7e4	898e8852-e40d-4b2a-a8f7-3e215268febc	1.000000000	2.00	2025-10-29 01:57:52.644509
81b28773-09a2-400e-b717-bdd77483e273	09fe1c65-aaa8-4d9a-bb8d-bf35d35c2011	b03668e6-821a-4e06-b541-1cd2e0ea45af	2.000000000	2.00	2025-10-29 01:58:20.453376
ba0cf720-9c0e-4cf0-8c10-ceebabdbbced	df4f45b4-0952-460e-88c5-60dbb103b6dc	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	1.000000000	2.00	2025-10-29 02:04:20.774704
0d878272-d06b-4262-b2cd-b44a26e2c369	e7eb7aac-6cae-4a11-87e9-a63b9cd6dcf6	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	2.000000000	2.00	2025-10-29 02:05:41.935751
cdd8731d-66b6-49e7-b24c-16796344516f	e2a4153c-90cb-494b-9b8b-f5984d9efca0	411dc4b0-c7f6-44ba-a7cd-dab215760984	2.000000000	2.00	2025-10-29 02:12:46.40777
bbf0a023-87ea-4a31-85c4-a4af26c868b6	92cc4860-4254-4042-b0ea-c2fe279316d9	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	0.200000000	2.00	2025-10-29 02:15:40.410953
228304df-644b-427f-bcd7-dfc6c7105849	427971a8-c840-43dd-be77-0441550ddc5a	d6f78f80-b222-49b8-9412-eea692bcaa34	1.000000000	2.00	2025-10-29 02:17:37.580396
ae6f28ea-6202-426b-8c37-2ffc1496a119	0adeb93a-44ec-4cff-a1d8-ca786d23ba6b	d6f78f80-b222-49b8-9412-eea692bcaa34	10.000000000	2.00	2025-10-29 02:18:18.731778
9e5005c1-5942-47cb-b90d-915c2a1013f3	1d587a4e-b012-453a-af1e-9e5d6d62ca5f	d6f78f80-b222-49b8-9412-eea692bcaa34	9.000000000	2.00	2025-10-29 02:18:38.334634
535a50e7-953e-4ecb-8a66-d981f1612df9	a923f01c-228e-401a-b33c-92c5eb05cbc5	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	10.000000000	2.00	2025-10-29 02:28:20.593715
60a30a70-a4df-4b3b-9360-4b5c01a2e740	f6e7022f-f6f6-41dd-b13f-41df29e1d7b6	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:30:39.809856
e777ef00-7881-4b81-8ab1-493c70dc58e8	81792d36-f986-4298-9532-aa7abf64acb6	d3e4a456-7bbd-461c-8806-50dee853d118	10.000000000	2.00	2025-10-29 02:31:20.708527
8de669ae-9e87-4de2-9dcd-2ab5c8b1de98	66bc3c48-0a2e-481d-968b-1073684deeb1	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	0.200000000	2.00	2025-10-29 02:31:47.951662
70a764e6-376e-4620-a61f-9b0578e64903	b0bf4611-c653-42dc-89ec-54388d211e3a	37ed79db-51d0-4907-aa94-75502fa74c5e	10.000000000	2.00	2025-10-29 02:32:52.713846
a0e6b94c-ef28-4688-aaa4-723ace124500	418a08ea-f48d-400a-b968-a25d2c2f6695	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:37:45.02125
9c20d5ff-cb48-4779-8de7-f28f8ad8da2a	709e8403-6c96-4a02-a9fe-623e74f27f64	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:37:53.363274
29d57075-f841-4970-9b48-13b6e7df9b64	543d5233-2da3-45c0-bf32-5cd70efc4b02	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:38:01.783617
824ef51e-c658-449f-b4ce-53cf67151070	9b87ab09-8af1-4823-9b5c-0f0f296bf2c2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:08.463138
49814fb5-fff7-42d4-b9ad-013be7c90bc8	92019caf-10a4-473d-a60e-8fc9a589da36	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:12.933887
5eafe7c4-d25e-4525-86f4-5e82ad34527b	cb1eab04-71db-4acc-989b-3c4fb00d84af	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:18.269539
63a308b9-b3d4-40d8-95a9-72ad61c405ed	e370b63b-bb18-4d7c-bab6-ba678f819dbf	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:22.077941
53051562-52c8-4175-8ff0-407b06686b94	06f88a9a-c6db-4d6e-b651-2888684a958b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:30.525284
01b434fe-f5fd-423d-a089-8105e70afdc4	270c0bc8-f124-4171-b949-53129dded070	e5275105-2102-4d2c-afda-0440b7afaab3	0.200000000	2.00	2025-10-29 02:38:30.903863
1862bbdc-65e3-4024-a3c5-1fece25b45ed	a5bd61e1-c40e-4b2d-8fad-b008eecc6097	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:36.013725
868f631f-486e-4e05-bec2-ff89ff7e8af9	26396821-12d4-4b9e-8964-9c524d724cae	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:38.005309
69191288-3721-44f8-8aff-baeee4a55df0	9e574d3f-5383-43cc-a964-37b2a290085c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:42.663786
26a62664-8651-4d6b-adc9-e61834a4484c	70af32f4-b20c-49e3-8849-f3e575b13308	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:42.968787
4e651315-7ed4-46f8-b5b8-c2146aec586d	ab87b012-346d-4db7-a7c6-fb0234fb261e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:48.366727
ff05714d-bdfc-4b55-b013-aaa515c12cde	8c234e5e-b990-4a7e-bbe4-6b0040f336b4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:38:54.011747
6debe89c-9721-4658-8d4b-aa3564bf0e07	4beb140b-6fb5-4748-a345-b05fb0f318f9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:00.292238
bdea6cd9-8d18-4e1f-ad17-0264a662f97e	d00d5715-4842-47fa-8815-419999f93602	e5275105-2102-4d2c-afda-0440b7afaab3	10.000000000	2.00	2025-10-29 02:39:03.856728
c1c1043a-2626-44b6-b2ea-6e04a7ed9be8	638ec9cd-8ed2-4868-8c97-50345461c876	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:04.521937
950ca4de-6afd-4baf-af74-7a5921e42b7e	f0792a47-49f6-4b16-b992-84c2d8cf833b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:15.949062
175eaf6b-7601-403d-acd3-7bc7a63a1d56	6c63aa74-6a45-44ce-9ace-2c50b3a7298e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:16.166736
71519ac4-ad46-485f-9ec6-fdf4fc7bb45e	dd3fd94c-10d9-479f-96c4-d2cea98d54ba	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:22.905832
0912798a-a571-483d-b663-d1a96f0e54e5	f308bddb-80fb-4206-b8b8-499ce848c8b3	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:25.490282
4f77cb18-2331-4bf5-9d90-44e69633ce36	a57bdd59-ff7f-40ae-9a2e-67bd9b935ddd	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:26.244826
f45042e8-3dde-483e-955e-14f87782546d	9479e942-6679-453d-80be-b5a426c5a50e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:31.156751
4d7fdfdd-0c6c-4179-ae84-dcb88262e620	1fdc03e3-f216-494d-836c-6cac8a8df047	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:39:38.866056
4c070337-1d45-45b9-9968-bd66ad16d703	83141eeb-8985-4e1c-8cc9-3680fc86f6e5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:39:52.451324
94ebc9a1-99c8-46df-a919-5c259bfb8b65	0a72981d-a0d0-41f2-a66c-a0c9ab9f57f0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:10.201303
b7ce6cfb-a0f1-405e-95e8-77b2815eac60	619c550f-b946-4b8e-a079-981763ab61c2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:10.295179
c5560cc3-10e9-4e5f-84ff-7cb77eca518f	c6674308-1f38-48f2-afa4-27476a4a7d04	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:36.087302
8f1b4385-5a1a-4830-9a9f-99859ddc1d4d	a1d703a3-86ad-40d5-ba51-cde9265a58cd	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:40:47.42185
93e1d123-acdd-49df-b6b9-c4548823a86f	534d35da-0794-47d2-8b2d-944ae3a09259	e5275105-2102-4d2c-afda-0440b7afaab3	2.000000000	2.00	2025-10-29 02:40:21.322139
1dad191c-6601-4341-a89d-1969ab1080ec	81acfc82-96f1-465f-b829-0426899066c0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:40:46.62027
58cf7892-d58d-4c97-a11d-ea7dd08dca92	edc93077-ae1b-4f23-b758-7012409b0b9c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:40:47.614496
7c56f55a-6422-4005-a703-e7a396b8f623	012ef30b-f38f-4db3-99b9-db1d000593a1	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:41:17.843267
9fa3fb34-375b-4569-9138-6f5a2ff45f29	7ea2d203-1385-4822-8d75-73654e81ad83	e5275105-2102-4d2c-afda-0440b7afaab3	2.000000000	2.00	2025-10-29 02:40:36.698565
70922c7e-6e88-4028-b97c-bfc0d6828765	43d8ed5a-b7cb-45b7-bcfe-dc8fa4ad4fe3	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:40.445071
79898dc3-d874-46d9-bef7-a68ca34b8c40	ed4350b2-7e0e-4fc9-8337-7d93791edecc	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:40:40.56623
d7f30d1e-c4bf-442d-a649-eaab315eea48	874e357d-282b-4529-923e-0c89e2802e07	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:52.236433
c1dd62c6-f2dc-4f2a-bedb-46c2467d6f94	e654d106-cf33-4e3e-9b51-2aff47ba260d	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:40:46.63494
65c4764e-0299-4d66-b15c-d439814f9324	21274a85-a791-4891-ab61-f33708f35b07	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	1.000000000	2.00	2025-10-29 02:40:52.355664
6f0bed09-bcf5-4697-add6-8630ca661c3b	0b270dda-b5d4-4080-8d17-6c550aab24e2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.200000000	2.00	2025-10-29 02:41:21.515371
c29ad411-12ae-414a-9fd0-14a59a6598da	33a51963-cccd-4037-959e-e5ffe2297a74	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:34.708035
fccf4bf9-27cb-45bf-a798-323a28e4d8e4	33297b17-a4bb-40ae-b702-5c4a626861d9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:49.556374
70fda2ee-8879-4b86-a2b1-feb7d2ed17c3	1e5448fb-f964-40cc-bb48-dae541a256da	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:49.758421
ccd9eeb2-22ea-42f8-ae79-3cfbff7bd75d	6b4bbd90-b7aa-4c25-98f4-8063be6b4086	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:51.591907
434390e0-1604-48c4-af0a-df29706b4e57	5160d71e-9cdc-440f-9e29-5808b8f7e160	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:55.229635
3e97b586-8e9d-4d2c-9acb-010129483226	bdcfa728-7126-4847-8bf7-cd008795c9d4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:41:58.626148
db390284-6aea-4784-a36e-5c2850f5ab27	8dc79b74-50ed-43dd-bcba-082a2d89b33f	e5275105-2102-4d2c-afda-0440b7afaab3	1.000000000	2.00	2025-10-29 02:42:05.702956
9fd5f419-20be-4394-bc17-bb13f6230279	d09f52a5-17ac-4845-9df7-4134d18d822b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:06.218545
6e847cb6-58c3-420b-941d-6aaaaba159c9	5df6eeb8-440c-4b22-a2ac-edc117e5e55b	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:14.068025
cc657222-e15c-41e8-a63c-e409f28b34cc	6c88a150-30c7-4c43-a0d0-90e27d87418f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:18.506496
fdada1a3-5d45-4605-955a-1b161fd1c54c	621d6f34-8fa6-4986-bded-a400c24bcfd2	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:26.882325
cf2f0296-c21b-4420-b266-7e3ab7df82ff	82840296-512b-490b-97b6-a4f8925e9308	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:27.263813
ffd7c740-80bc-4369-a15e-199a6e02899b	2f2b7d56-1cae-4905-8fa7-f380566db533	e5275105-2102-4d2c-afda-0440b7afaab3	1.000000000	2.00	2025-10-29 02:42:28.150852
c78c23d1-bf8f-4501-85aa-169eed563b02	c8af9b86-63d7-4e8d-8834-777d4fab404e	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:42:29.252142
ca03ba96-88ae-44c9-a208-f6bd0bef871d	dacb116c-63ee-4dbd-a050-8d81497b5d7e	e5275105-2102-4d2c-afda-0440b7afaab3	2.000000000	2.00	2025-10-29 02:42:50.701701
d8f724be-2f79-48ae-88ed-c989e1a016d2	a9ab8eb5-ffb5-4ff6-a7e2-04bde22cde6a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:43:03.35972
1932b1f6-3916-47a0-aa84-737b099962e0	8610ad02-02e2-43fb-9a12-5e1ac6eaba23	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:43:03.487219
1d9d4a0f-ab77-4124-b7c5-6f04bca47617	e26d58e1-5211-41b8-b706-ab41a8120213	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:43:04.303979
44ae6ada-78a5-45a4-b5cf-dce69dea5013	a9e7bbcf-ab6e-45d8-974c-746c3cb79980	116eace9-841b-48fa-a7ec-d3249bb3aa80	0.200000000	2.00	2025-10-29 02:43:14.632497
e686860b-50d0-4167-856c-71d9c590cf49	705c9c47-463a-4cd8-8082-b16c899140aa	116eace9-841b-48fa-a7ec-d3249bb3aa80	0.200000000	2.00	2025-10-29 02:43:22.664449
fd5f5033-685c-4ceb-9fad-e8aead5bedec	c11459e6-e93b-4d4e-8164-c391483bc8e6	898e8852-e40d-4b2a-a8f7-3e215268febc	2.000000000	2.00	2025-10-29 02:43:30.676396
741dbc92-00da-468f-b572-f328e49f7e11	7876f556-076a-4d06-a98d-020de245b06c	116eace9-841b-48fa-a7ec-d3249bb3aa80	0.200000000	2.00	2025-10-29 02:43:38.343885
93730a2c-f51b-48f8-9cb4-02ea4185314f	22afcc53-be27-4232-be89-5c0f09725ea1	116eace9-841b-48fa-a7ec-d3249bb3aa80	0.200000000	2.00	2025-10-29 02:43:41.141016
c04b2bba-7509-4be3-9f6e-20499157cdb1	4c5b0f57-202e-472e-b325-290d7aac880d	116eace9-841b-48fa-a7ec-d3249bb3aa80	1.000000000	2.00	2025-10-29 02:43:50.340425
2c97f875-e388-4cb5-8bb2-15f0bd8c6db3	caf04a91-ee81-466e-bc46-4d9ad0c2876c	116eace9-841b-48fa-a7ec-d3249bb3aa80	10.000000000	2.00	2025-10-29 02:44:03.097651
fac1da99-afde-4840-8a1b-ff44e5aa6826	a67cc0f5-a4fc-4d3b-bbc2-050380d51f4d	e5275105-2102-4d2c-afda-0440b7afaab3	1.000000000	2.00	2025-10-29 02:44:37.577165
30aaf36e-9030-4fdf-ad35-5907114b6837	f743bd2a-02b8-4dac-a1f8-fef9df7dd309	e5275105-2102-4d2c-afda-0440b7afaab3	0.200000000	2.00	2025-10-29 02:44:45.623662
b96af1c9-3036-419c-8f2c-d8daa908ea1e	fadb28e0-297a-4dd3-b157-eff8ac3b2596	e5275105-2102-4d2c-afda-0440b7afaab3	0.200000000	2.00	2025-10-29 02:45:08.004963
f85ad2e2-7125-419e-9027-5eda327b5007	f7eb5cfe-4d78-462a-af12-fc1178de3357	e5275105-2102-4d2c-afda-0440b7afaab3	0.400000000	2.00	2025-10-29 02:45:22.588454
02f7896e-66dc-49b1-9045-6729affee841	37d22865-8fda-421b-beb4-ee0537681969	7c7bb616-dc44-412d-b05f-2c34fc58929b	1.000000000	2.00	2025-10-29 02:46:24.62101
cf4672d3-9af8-456d-9103-900b2afe4600	5d52d62d-ff2d-46ec-9e3c-ed98673739ac	898e8852-e40d-4b2a-a8f7-3e215268febc	10.000000000	2.00	2025-10-29 02:46:36.641938
f5667ce8-f1e2-4183-a39c-22e40654bf39	18226049-2e8b-4cdf-b2e2-ec15b53976bc	7c7bb616-dc44-412d-b05f-2c34fc58929b	10.000000000	2.00	2025-10-29 02:46:47.713461
20653b1d-647a-4439-9d21-d9e1385e9806	bcbc08f2-6a82-4ed8-b41a-eda2ef3e9be1	7c7bb616-dc44-412d-b05f-2c34fc58929b	2.000000000	2.00	2025-10-29 02:47:03.225692
767cf371-cde2-4086-bb6a-cd17dc0d42af	a6137e2e-fa37-4f81-bcab-9bc08f0530b9	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:18.622991
163049da-d8fa-4a64-a8e9-0e993df7e63f	0ca50bfc-aa18-44d4-8123-62ec474e24f4	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:21.491454
1693813c-4d01-4186-9ce3-f6c48f500067	b7da1153-f007-4096-af20-8d75c34ca24a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:26.011204
564ca394-757d-441d-9394-1f2c0eefbe30	40bb18f4-8fe6-412a-b7eb-bc08a05bda36	7c7bb616-dc44-412d-b05f-2c34fc58929b	1.000000000	2.00	2025-10-29 02:47:28.019215
ce8d2d9e-f0e4-4ab7-a5ee-835ccd5e0f45	c7cd54ff-233a-4273-9aac-09d719d5a4a8	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:30.738244
c36c4c2b-ea2b-4f8b-b7bf-efc25fc19cb6	4d435b05-e9c2-475c-82cd-090503e0842c	7c7bb616-dc44-412d-b05f-2c34fc58929b	2.000000000	2.00	2025-10-29 02:47:36.570588
151cf7e0-8e33-490c-8d9c-a26ebb8be504	f4efb4bb-ae1a-4191-b0d7-04524f767728	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:37.907613
c46526c5-7ae7-42c3-88a1-01ddc74040ac	38616763-6897-4244-9843-af2209e7a631	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:43.2069
aada7a95-95d8-4d58-8d07-c2f8659688d7	c2a4a91d-ff04-4f0d-9701-6685f6905e40	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0.020000000	2.00	2025-10-29 02:47:43.774615
38ff50ae-30db-49ed-8936-44ed0e1794b3	ef641307-327c-464f-a45f-358450ac272e	7c7bb616-dc44-412d-b05f-2c34fc58929b	2.000000000	2.00	2025-10-29 02:48:36.090056
9aff6744-4594-4d74-ac65-435b5d6444d0	a1f444fb-4d5f-45b1-8ea6-907e8da65ec6	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:48:36.235814
162545ab-53a8-4e97-8a6b-e60da194404e	25d033c7-cc02-4a01-a98c-5cd1cfc51fb6	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:48:40.056299
ba24c063-7434-4b3b-bf36-5002934f852e	8291e395-ab4e-41f5-9549-173d0bd4149f	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:48:42.783887
cecef2e6-1b14-4da1-825a-21ed9c1e0fbf	ce15857a-0b3e-4af5-899f-270f27e7e1f4	7c7bb616-dc44-412d-b05f-2c34fc58929b	2.000000000	2.00	2025-10-29 02:48:48.3005
c26ce4c9-65b4-459b-9760-2a0374125d9c	45a7afc8-526c-4c06-8a2d-418afad927d1	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:01.451543
28a8a8e3-9ab0-4388-83df-518122c22b06	0fc60ad4-26f2-442e-beaa-995b75c6f53a	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:22.136738
b4c7d0de-4cf1-4f12-8392-095feb6bdaf4	8654ec2e-205b-4e01-bd5b-a96748065d48	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:49.896926
65460162-3432-4866-9570-4e57a46e16bc	a198cfc0-5d14-473a-be11-ffe8518d9e24	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:48:49.80514
dfc8ee63-fd1c-4b28-acd0-2fcb2bbe5115	06ff8b04-945b-4e46-8c8c-659dbe5f1777	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:48:54.628489
045f83cc-4154-42fa-b1ba-7f176880f35c	de811dff-4957-45b0-bc24-9df5168dde0d	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:02.543254
58e1cdf0-239e-4450-9a74-f387ad06603b	d5c7f913-730f-43d3-87c6-33993d251ad3	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:08.146178
4ef9303c-ef88-47ef-b656-50be3db42abf	9b7afacb-98d6-4ae8-9f23-68888ebf9d7b	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:15.257907
54614995-e8d6-459b-bea3-a1575c2b9c15	50078f79-60e7-4bc9-9919-860b615d86f6	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:36.897707
7fc07343-147e-4106-b814-a6a39cfe5a6c	2790a711-c3dc-427d-a839-a4d668ae1b87	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:04.64338
501ca5bc-98d0-4622-b615-f17a648cd312	699e7e59-e484-4ffa-81f6-1a6046a7b173	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:05.013264
117ba67f-c3de-496b-a707-7014f416eae4	ea565341-8cda-4346-ac6c-b573e3e111d7	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:28.326021
ed09ee73-0dcc-4cba-b7ca-53e79c88eb6c	8999bddc-af3a-4394-91e8-6542850a9247	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:34.213918
2d0c01df-ff03-4226-8892-eb96515040e4	327b0016-4a38-46e4-b114-6479d45a8f5d	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:42.876453
e86419d0-9a88-42db-a202-1ab7682f421e	fc333c54-5d63-4f3e-bcf1-2ed06f18aec5	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:52.057517
c9ae02aa-a287-4ee3-bfac-f608670f3ac4	c3802933-7041-4d7b-96d8-d64d54803aaf	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:06.203013
620e8416-f7c1-4e80-b4af-fe4a4c2f29e6	9991d510-7ceb-4baa-b656-4e7780f032cb	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:24.90129
190bf3ed-e4a2-4012-9cc2-0d808090390a	340691f2-80b5-4d44-a07b-4a3ecb42a4d3	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:40.658939
e7187f31-957c-4b25-9794-42f629ac063e	b2bae44e-65b7-4723-bcc3-4c27ba4e2f7c	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:46.462936
eb383a8b-10e4-43c8-8352-c16debd41c1c	bb75857d-b2ae-44b0-a3c0-e2b7b9cc4b78	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:12.672837
793b3eb0-871f-4730-870b-3451ded0d289	5b1e78fc-6c94-490d-808b-ea3b38ef5c30	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:31.293978
45c031c6-3896-42f4-92a7-ec193d41b1c9	6fb38996-08d0-47b2-b431-ce5c62cba05b	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:26.146617
335b790d-ee15-4d28-ad8d-655dac9fe4ac	4431426e-5a16-4403-97f9-8a8e927eee4d	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:49:27.472838
a34f001e-51f1-48a8-abf4-f2e35b4be897	4aaaf8f9-128e-4083-831a-5bcc3b3802eb	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:30.153732
a490ab47-c799-4977-8b03-3b1c81e4543b	3850124f-7188-40dd-a1ce-72ddb094f67a	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:34.046339
81b9ef8d-ae2b-44c6-a823-6c45d91c26a8	db4e7aeb-9e33-44b7-948f-1847790c46cb	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:37.423053
91fe71f9-ce2b-4778-85b1-4cba64316a94	35fc10a0-6b7a-480f-955a-10ca19afd0e0	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:40.5532
44922881-b95a-4a65-9efd-d5e3127eed4b	519ed339-837d-4961-a9f7-fefc929adc9d	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:43.43119
5c265a27-4651-428d-8754-79bf806499f3	97d68370-fd27-455b-bf9a-33ebd6507457	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	1.000000000	2.00	2025-10-29 02:50:44.61822
d33a0aa4-f257-485e-a7b8-b8378770a0e1	d8af1b49-8f32-4e49-a520-4d8f0e53a87e	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:53.391634
6fb5ea98-b31e-45ab-be9e-2193bbce4ca8	04474327-fa53-47d2-aaa5-1d890595c4c1	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:50:56.701975
fc76e14d-1846-4572-9c68-d2f770595c13	db9fc883-691f-4d18-86be-c6ccb76b1fae	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:00.241611
00579f72-bdfc-4e5e-a238-225f6873e001	38c8776f-8251-48ee-9a79-5417ff4abc5b	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:02.371214
acabf512-19fb-4fb9-9986-81addf1bfac9	2aa747c1-07c8-4262-85b7-355c4d3f428c	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:04.938262
722e973e-a2f8-4fba-9fb9-beff23fd1249	02fe5f3d-9515-4675-b9ae-d75650c86544	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:07.383918
bef58247-b824-4755-b213-774647ad1bfd	c78a07bb-2577-4cd2-9153-84196d2886c7	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	1.000000000	2.00	2025-10-29 02:51:09.403429
3b7e0f47-4c76-4ced-8027-711c8fe68f14	8e29f737-82e9-442d-9e8a-ef8e3812a8d5	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:10.90737
9cb0cb35-f550-4de3-b18e-91ac2b3f3114	530e11c3-f4ba-4423-9faf-1dbea6964fb0	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:14.913413
73c5a9c7-a183-41be-97e4-5249f7522dde	8f719e09-63b0-4377-b650-13b8a158fed7	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:18.456451
3be58019-06f6-4f18-935a-6e5c2d79f1b0	171a1fc1-4335-4b8f-a14b-37086dffca3a	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:23.697983
099c65e7-53a5-4bc7-81d4-d63c5450f6e6	219ed51c-75dc-4127-b69f-537835398219	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:26.274625
f0a961cd-300c-45c2-847c-de5bfbd9e6e5	85f121c0-2ab6-4026-ba4e-f3ee77b6af65	781a2101-8dfc-480e-a185-69fab61df3cc	0.200000000	2.00	2025-10-29 02:51:29.10093
8e63b13d-346d-4248-a889-21405971755c	cba3a323-a894-45d2-bc9c-8b3b7365f0f1	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	2.000000000	2.00	2025-10-29 02:51:46.416321
5a9d2b4c-8a5b-4fe0-afde-cb438612cb04	206db6ed-eff4-4ca1-8621-954924e85849	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	2.000000000	2.00	2025-10-29 02:52:21.019953
4511f269-5aab-41fd-9870-9ce18b70266a	acccf8f3-2d26-4f0d-9c24-5cbfe5a49e06	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	10.000000000	2.00	2025-10-29 02:52:33.881304
f49982c0-f81a-4029-bca3-ac2ababad47f	21b11856-9130-493f-a954-282950d99781	116eace9-841b-48fa-a7ec-d3249bb3aa80	8.200000000	2.00	2025-10-29 02:52:44.875478
96c14341-1017-4392-afc9-12e5cd339778	9288bec2-5875-4c53-a470-f6c710887ad3	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	4.000000000	2.00	2025-10-29 02:52:49.02087
6bfb0e49-d4ec-4e73-9bac-982094a454f4	6ac0f5db-bb8f-4315-99dd-0b439c9d65b0	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:53:43.336048
f93cfa76-4a1d-4df9-b7b5-d4221cbb0d81	fc2f8680-f619-4376-bb22-f3eaa4fcc973	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:53:46.246157
9263b57a-a27c-4fdf-92f1-dcde37e2c879	03c49612-6c66-46ca-b69c-bbb26b98b134	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:53:54.401129
481e4c6d-b638-49d4-a7ba-d966cce616e6	2beaf310-9e15-4702-bc93-346d79403c0a	c37781bb-d03a-4b8f-aa8b-972ee268014a	2.000000000	2.00	2025-10-29 02:54:16.643174
e32bc600-dbd8-45be-b7a0-3a6bac7b137d	b2f0d3c5-b41c-4f0e-b922-0f80afd26e2c	c37781bb-d03a-4b8f-aa8b-972ee268014a	1.000000000	2.00	2025-10-29 02:54:26.243662
9875b89e-0981-4ba2-8fd3-ff5788df9f7c	318c90d7-7863-4906-a4ce-26203f463ae5	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:31.714119
94ca73e0-12ff-4f59-80fb-fe11ed87b42f	f2b04a30-2070-4a78-9eb8-8d41655491a5	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:36.891252
236c22de-62a0-402b-b89b-cbf90a80112f	9c8276a2-56ca-474e-9ba3-0922a24fbadd	c37781bb-d03a-4b8f-aa8b-972ee268014a	10.000000000	2.00	2025-10-29 02:54:37.04328
54e791ab-5d31-44cd-94cd-567e32ed3a0e	3cbde66d-b3b8-493c-9740-488145ecf480	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:41.524197
49269d38-41b2-4b0e-a3e3-80dde58dc9a6	4b04acd7-c481-4b44-b812-c069c789f831	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:45.097476
5e5c4a7c-43a1-4be3-88db-e79ae3857a18	eab801eb-fcb9-4896-9757-24061c9fa3b3	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:49.353844
0075ff77-06de-4a32-9757-00684d43da5f	c9d7bf5c-ac45-4513-8fb1-db816ef4638c	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:54:52.426147
8f8657ec-9197-465b-8f40-e32eae692659	3d343c90-e502-401b-be35-36ecbb3f88e1	c37781bb-d03a-4b8f-aa8b-972ee268014a	1.000000000	2.00	2025-10-29 02:54:58.62236
a723fb4b-7799-45f2-ae73-72e235ecdd28	a7248731-0f5e-4ddf-8115-676230370311	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:00.618353
b57bd6cf-8937-492b-a46e-1eebabc0694d	9dadbc43-d697-48ca-a4d8-9aa51d6750ad	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:02.99669
330a2c5e-8fd3-4261-8ee8-c4ddfc594322	2aec9d34-3e2d-42c8-9aab-2f75fd04a9cb	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:03.23601
c264072f-56da-4734-8532-5b09e0a12a7e	9422d1a4-aedc-4fae-bf17-d46b90af3ec1	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:06.738737
b812e0e8-a613-4099-b08a-f7e5c5267760	5c2609f0-c526-445f-9615-21d7c9254f82	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:13.141057
d4de35c4-ec68-4481-9ae5-e393b1331936	6384388d-112d-4307-9fb6-3d868fdd6bae	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:21.307591
83319366-a2f3-46e6-aebf-2ec63acb4582	5998ae1d-07ef-4715-9985-e289a00fe343	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:23.860572
0204f5a8-75c3-4d84-8cb1-e602f111121f	97178ad9-d2c1-4292-af91-42ba8ec4892f	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:24.312041
7857df25-f277-4413-9f99-84cbf446e53e	9d800953-1dd6-4cae-81dc-00877c98a203	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:26.505719
51602fc5-d403-4c93-8b5a-bfa762e9dcc9	cd4226cc-af96-40fe-a1a4-be042e2fb0a2	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:29.232578
bb1027f3-66c0-486c-b4b2-cd488f19e2da	54303d61-c52d-41b3-ab24-53df52524f7b	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:39.499296
025f9440-5ea4-413c-b1c7-f193f35c3886	2efe8ce7-6290-4867-8736-4ba9a611fe0d	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:43.102542
a5d56754-cf47-427f-b419-1b2634408d53	34bb56b8-0d50-43aa-bf8f-daceeb51fa5a	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:47.243214
dfb21b40-1d92-462b-8379-57b21f725e4b	3557b692-2038-49ee-8c67-079d325fd0ee	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:15.873454
a7a1ba4b-6613-4ba2-90a3-92baa41580d8	5c28b328-85fc-4020-bb59-66ce21be06da	6b9280e2-476c-430b-9470-05ee75118ac6	1.000000000	2.00	2025-10-29 03:00:20.946669
1aff2d99-b4d1-4374-84d1-a09e2a43011b	e9019c3b-117b-40fc-9e5e-e92319f9176d	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:51.033883
2678fd6b-2b70-4b02-a6a8-222e788eaa62	5a1e4a0d-7a7e-4193-b92a-74e4ecbf9279	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:55.699479
1756fa0b-2649-4959-a642-85942ed5debb	b125bd1d-454f-4e40-ad5a-0e7fcf27fd58	6b9280e2-476c-430b-9470-05ee75118ac6	1.000000000	2.00	2025-10-29 02:59:52.735723
f35171ff-87f9-41ff-a1d6-e07c6a79412a	96467dc1-2f71-4082-a42c-4f9b2ee56a10	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:55:59.769549
7f5cf5ee-f6f3-4de6-afd4-0004bf3f484e	f78be5a3-1c72-40c8-a036-a713c74c48d8	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:04.071028
69733d80-dfc2-4647-a5c5-e94e976d875e	b46f1693-5e58-4538-8a3a-57397282e1e4	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:18.632244
6c441883-4cd6-44e9-98e4-e552bafd6a5d	839cb9e7-9be4-4acd-a72a-4a70d117b7fb	6b9280e2-476c-430b-9470-05ee75118ac6	1.000000000	2.00	2025-10-29 02:58:21.025568
a102d7b8-0afe-4875-9942-a06e3370c269	36c0f3b3-22ee-4536-b12a-c80a473f64d6	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.002000000	2.00	2025-10-29 03:00:28.198235
94a95712-b0a7-44d0-ad96-7a09ddd05967	e27da32c-3444-4600-b2de-6c7477cfc35d	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:07.63851
8d6d80c9-4ebc-4b21-96e5-cfa534af7f7e	7dca2672-cfb1-47d5-965b-d4e11c41cb42	986f6e58-f06f-4981-a9a6-4d721e24cd15	2.000000000	2.00	2025-10-29 03:01:09.699077
00121954-581c-42cd-8938-f95a1ab5f56b	e5c6c3a9-e589-494a-bbf4-e6a2f0a39cdd	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:02:47.949737
7eed15be-54fc-4215-9d2e-8df4b808e98d	b61d0885-bb44-4f90-b09d-71bc8ee341c3	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:02:51.494756
d3744d3e-a7f8-4cfb-8603-97396c97ae15	bb07a53e-ba75-47e2-ab14-84271ee02b0b	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:03:01.594455
a9d96fbf-e123-48de-a313-d476b36614d9	b54cba5b-ba22-49b1-9cb2-1d543a97ef36	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:10.227486
215b9ba7-e7ec-43c1-9997-b8417c68488c	8acb5fd9-3b3e-418d-8f74-f6d94ec31e88	6b9280e2-476c-430b-9470-05ee75118ac6	1.000000000	2.00	2025-10-29 03:00:53.175139
f13b4049-7315-442c-88c1-29942c5ab332	85dab448-a427-407b-89d2-97f99f87ecb8	781a2101-8dfc-480e-a185-69fab61df3cc	0.020000000	2.00	2025-10-29 02:56:21.016645
f7e8350e-1481-4539-9fe3-f2125220c748	544f9435-6dd9-4d9e-8b83-b428b0d43c83	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	10.000000000	2.00	2025-10-29 02:56:24.423023
75fbd99c-26a5-46ff-a448-8e560d86eb3c	e8678d4e-4007-49b8-a273-4de7c78deb98	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	1.000000000	2.00	2025-10-29 03:00:58.5619
7e2073b2-ca0c-4b85-bff9-c4ca3e100340	89cdbb83-12a6-4859-91eb-0b0d71777e29	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2.000000000	2.00	2025-10-29 03:01:11.933294
8e9456f7-4ab7-4f66-bc24-989cbfe197b3	268b6bce-5a5b-420d-af89-b4ce2bed7b1f	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:02:58.088387
99c78ea1-00d3-44d4-9ed6-75a79ca8248f	f1ec7a0d-c0c4-454f-8a44-76239b8ad852	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	1.000000000	2.00	2025-10-29 03:03:06.443384
32801271-b1d5-4915-933f-3a2577a85b49	8b927384-736b-4f82-888f-2e106af71fa5	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:03:59.973197
27b4c653-29fd-487a-a739-7d90a395b49b	fbaee9c9-eef2-4e03-afa9-4053833c4537	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:04:03.219266
50795613-1840-40fa-bfaf-42150fdb6149	c2dda7d4-cae9-48d9-b09d-b071ddd8967d	0630514b-c953-4b9c-bea4-1fbe518040ef	0.200000000	2.00	2025-10-29 03:07:06.360712
8a74a51a-cd47-4969-b50f-50490a38dc1e	82d1cd1e-22e8-48bf-b430-752ac83df6b4	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:17:49.546375
5fddfe24-a26c-44f1-b08f-f348ca0fb229	ddc5de9b-a0e5-4667-850f-6df6e259ece1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:17:55.972688
002b3a67-dcf0-4ded-8fba-2f34924647d0	e209bb37-afcd-4657-bbc8-99b77f161bf1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.200000000	2.00	2025-10-29 03:17:57.264503
a60f75e8-69f4-46e4-839f-6ef31fbd9810	304ab82a-f7bb-46d9-a7a1-92ac1bdb37a2	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	10.000000000	2.00	2025-10-29 03:18:11.695635
97c939fc-7ffd-424c-9480-b86c0702d528	90af1fcb-af6f-469f-8f3c-4a43e9853a7b	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	1.000000000	2.00	2025-10-29 03:18:17.652249
504246a9-f984-41ad-9e58-45bc65372e82	3c2bc84f-19a8-42f0-b71a-85ce142bb6f0	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	3.180000000	2.00	2025-10-29 03:18:44.804067
91f94db7-1aaa-456b-a1e8-f03d86e14dab	8d4f6595-c9c8-4835-ba74-d0f1f096bf5d	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	0.018000000	2.00	2025-10-29 03:18:55.099908
fe35e502-6882-49a1-be08-a167762ac593	1b3a6fc7-ab05-4423-a454-888d9adde5f6	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	10.000000000	2.00	2025-10-29 03:27:58.106749
7cbc4255-ba99-478b-acb4-36091c27d9a3	e07b615f-c169-470d-9834-36fe79b23c75	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	0.200000000	2.00	2025-10-29 03:37:52.616851
8896be60-550b-415e-9725-aa404a3690ad	108e9c22-63bb-45da-a5d0-fd53006c07bd	477a8b79-e143-4a9d-9973-a8cddae67200	2.000000000	2.00	2025-10-29 03:40:10.830967
b4e54bc4-69f9-462e-ac2e-24e4ae512428	8bf8b9eb-af1a-4332-9013-c8f362054883	477a8b79-e143-4a9d-9973-a8cddae67200	2.000000000	2.00	2025-10-29 03:41:05.525324
cbf04735-b01e-45d7-a408-2e0a2d472eb0	e40a31a3-39fc-4a8a-9e70-e7ca4e22b317	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	1.000000000	2.00	2025-10-29 04:21:07.408029
cffeb0a4-77f6-4189-85bc-e233b55be7ba	c15ac404-1331-425a-a3f1-bf15ef1911d4	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	0.200000000	2.00	2025-10-29 04:28:29.304243
06e323cf-28e6-492c-aeac-7f4a34acf303	0150206a-0bb3-4624-8fc1-b6fd7ea9c82b	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	10.000000000	2.00	2025-10-29 05:20:24.616651
e0c22b1b-5cde-4211-b543-599c5605acbd	dbd0b202-cca6-4255-a149-eee18bdb6f78	bd56d08d-5742-46cd-bc48-fb65d8d58111	0.200000000	2.00	2025-10-29 05:46:05.291861
89114cc7-a6bd-485c-a92d-eb1e03745949	b23a2090-6c97-4929-92b3-1578dee24b2c	97c3ead3-ae64-4a29-89da-5d5006dcbf43	0.200000000	2.00	2025-10-29 05:51:40.778858
038c50b6-8fcd-481d-af7c-27213a4730b1	d7760717-5afb-4fc9-b78a-f85d08da9b32	f166a726-47ab-404b-9555-16a114a5cb89	0.200000000	2.00	2025-10-29 07:31:19.018114
6327628a-3507-4488-99ba-afdb280a4094	583d2ae0-98b0-49bc-8615-0586b78dd61b	4cfa95be-699c-4019-b7e7-873475ad0fc5	2.000000000	2.00	2025-10-29 08:23:11.686938
d3e355a7-9a4a-4959-b88c-beac2f33e241	6de75f12-bfab-41f9-b267-02264af71401	23144889-a854-43a5-ada7-d9cb5abc31f0	10.000000000	2.00	2025-10-29 09:03:43.99827
b89c8e54-fbeb-4ab9-8c87-61c6d81645f0	cc2b903d-f564-4375-9ddb-9cd7074849c9	088deaa4-8a69-4d01-ac4c-a00a67444efc	1.000000000	2.00	2025-10-29 09:56:20.06679
b14b3280-3c4b-4116-a67e-5067a19aad3a	dcebecbc-3e87-4559-ba4c-b80e578afb8f	a85fd10a-3ea5-4f11-9740-799d19224b70	0.200000000	2.00	2025-10-29 10:06:38.010582
37ebc742-7c89-40d9-b616-294780480457	0556b6c7-972c-4e15-b8ed-bd6cbb9f374b	a85fd10a-3ea5-4f11-9740-799d19224b70	1.000000000	2.00	2025-10-29 10:07:40.265178
95a740d8-04dd-4cc5-9983-7c8e6ea038cf	bae2abc1-9662-4c9d-94eb-cc888fb1fea7	ae6cf106-8d94-4ca6-9e85-8165196a9011	10.000000000	2.00	2025-10-29 10:33:06.215488
e0bb10a8-4a56-4443-98b3-e26aae2a8c4a	636b1c60-0783-461d-adf5-2d16b5857789	ae6cf106-8d94-4ca6-9e85-8165196a9011	8.000000000	2.00	2025-10-29 10:33:36.913385
f88293c3-925c-4622-8c5e-3e85e76cb4f8	f00dc045-d18c-48a7-80bf-f62e835b53a7	9e1c1b26-c03b-4319-9e39-e477f314e814	2.000000000	2.00	2025-10-29 11:12:41.895922
ca550ad6-4c2d-4ba6-a6d7-3689e0a7dcc3	ef60dee5-b4fc-4748-8761-f78d9bbe7ca0	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	0.200000000	2.00	2025-10-29 11:14:00.210629
89eea18b-636a-4997-b4dc-e62a87fbce26	42a06248-2f82-4fc6-809e-cf61818d9e1e	9e1c1b26-c03b-4319-9e39-e477f314e814	1.000000000	2.00	2025-10-29 11:14:08.730481
d82db1f6-cfc4-47cd-80f0-9d04574c341a	03fc95e6-73ea-4f46-adba-295fca89485e	9e1c1b26-c03b-4319-9e39-e477f314e814	10.000000000	2.00	2025-10-29 11:14:53.255458
c5e6213e-996b-4745-a26d-763331411345	4708dd12-4e65-418b-9b3e-e3a4144bcc3b	9e1c1b26-c03b-4319-9e39-e477f314e814	2.000000000	2.00	2025-10-29 11:15:47.216149
a8ed8156-94ca-468e-8ff5-d5ce7c8e8e89	9840f628-0d94-4658-b5f8-0a485189f5b4	9e1c1b26-c03b-4319-9e39-e477f314e814	2.000000000	2.00	2025-10-29 11:16:24.316791
778b4678-6e32-42ba-9500-19c2fc166cd3	138d147a-4ef1-4617-955a-9e6020d8eb36	6f37eec8-c479-419d-bc02-5dc6064b7e2e	0.200000000	2.00	2025-10-29 11:29:06.003602
558a1176-14bf-496b-a94d-e3f6aff97ab6	faaba100-7814-4949-a93d-7460976d24cb	477a8b79-e143-4a9d-9973-a8cddae67200	2.000000000	2.00	2025-10-29 11:37:25.282335
6192d5e2-d25b-40d1-819a-8f576a992d2d	933e0a35-f439-4952-b032-6c405218b6f3	477a8b79-e143-4a9d-9973-a8cddae67200	2.000000000	2.00	2025-10-29 11:38:13.859129
15190c58-480a-4d38-87dc-eb622f15da35	4991170c-40c8-4ef9-a56f-2a7a5c5ba58a	477a8b79-e143-4a9d-9973-a8cddae67200	2.000000000	2.00	2025-10-29 11:38:58.835306
9aaa0087-a478-4043-9124-a83823fd0a9f	bfd18f1e-ab7c-4f3d-9a54-f6936d5e9faf	9095d825-361c-47f5-a10d-1aa6f559f7f5	10.000000000	2.00	2025-10-29 11:45:04.774157
f613bb07-23bd-487e-89ea-8c1e967721cd	8817ea4b-500c-437f-b2ea-6aa58398b27b	32735788-8647-4ccc-9ecb-54f45a69e878	0.200000000	2.00	2025-10-29 13:41:02.65781
a706980b-90ce-4b82-99dd-0f7b1f2fe327	31faa8d6-a7c7-474a-9807-aba050252492	64b0f2e4-508c-4efa-8b39-0b3569451567	4.260000000	2.00	2025-10-29 15:08:57.543938
61cabb42-c2fa-4350-8e75-0a5212863d38	851db082-b0d0-4aea-b297-ce06aca8820d	5f8d475c-cbf4-4590-93f9-490db5f1eb48	1.000000000	2.00	2025-10-29 15:43:46.835772
dce8480e-ff5e-4381-91c9-da658235d860	baa918d2-b20a-40e7-9ee4-8379126a3fb8	9e1c1b26-c03b-4319-9e39-e477f314e814	2.000000000	2.00	2025-10-29 15:56:51.115452
f2173fef-7c21-42c3-b910-2ef6a798fa84	760e431b-fac8-4832-9e6f-f6f9c89a8229	9e1c1b26-c03b-4319-9e39-e477f314e814	1.000000000	2.00	2025-10-29 15:59:36.831822
d0d74e3f-f276-4af9-a572-392886b9e593	b82a6466-9a38-4598-8a0f-da07f79f315b	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	10.000000000	2.00	2025-10-29 16:03:51.807047
bc55e301-ab9f-4e1e-a2d8-713b726d6565	5e4c5ade-47fd-43b5-b5a8-58d4be893625	f166a726-47ab-404b-9555-16a114a5cb89	0.200000000	2.00	2025-10-29 17:10:22.808056
7eb47012-c6da-4ac4-a944-7b067c2657c5	587a53fa-2811-4120-a517-b8f032cd77ee	74923495-465e-44cc-9609-5c8a1ed982ba	1.000000000	2.00	2025-10-29 17:18:26.875435
b34beba0-103c-42cf-80a2-98c701864c49	cbbb2245-9d21-44e8-859a-f1992a351a8f	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	1.000000000	2.00	2025-10-29 18:24:55.982937
acb5b4ad-f6f5-4a33-993c-4b89dc489b45	03dea7da-08fe-4c45-b6b3-cb54bbcbf209	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	2.000000000	2.00	2025-10-29 18:36:00.012338
c0363888-a8c1-48dd-b9b4-a679335515a8	3c7d1755-5bff-4bfc-8388-b610c319034e	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	2.000000000	2.00	2025-10-29 18:38:16.639003
a66015c3-327e-445e-9d04-affbdf538974	9299db3c-9acc-4cf5-9057-ced39c799e31	df9311d2-24d6-4018-9afb-e9d114f142c2	10.000000000	2.00	2025-10-29 19:00:28.028655
53740b64-262a-488d-920a-1cb353384890	48a9d37a-12e7-45f6-8284-a6b680f9afa9	27432bf0-e96a-4136-88ed-fe24815881e6	0.200000000	2.00	2025-10-29 20:03:56.523011
ef51320b-1786-49c4-a337-43893cd9f839	5ff9e940-0e82-4951-b564-af414b916471	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	10.000000000	2.00	2025-10-29 21:02:59.766761
f0a0b38e-7ae3-4498-bf6c-51098b97c583	14518425-569e-4816-8934-b390ad9ee1d5	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	10.000000000	2.00	2025-10-29 21:06:16.46989
7bf49164-4fcf-4e7d-9b41-ffda3030a7e2	3894b32a-4dab-4b04-b94d-14ddfb3ec265	78692077-9972-4fc9-9757-92e393af4830	0.200000000	2.00	2025-10-29 21:24:13.681935
c981aacc-b046-4561-826a-14fcb52cceaf	f0314549-ef80-4835-80c6-47321101b76d	8c3fd324-9419-40fc-ab4d-22229b75b911	2.000000000	2.00	2025-10-29 21:28:43.27474
f668f97d-2d9a-4b96-b583-ba222ac1f4b8	a54174e5-b4b1-4e2d-a66b-df01d7cf7928	e373c930-5e25-404b-a36b-0faf910436a3	16.000000000	2.00	2025-10-29 21:49:10.215989
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.positions (id, user_id, market_id, "position", shares, average_price, created_at, updated_at) FROM stdin;
0c003932-b1da-4cbd-bbbc-b9df32f4bf64	2a5a8384-d652-42e3-bed1-b03545d35725	73209b09-1398-4562-a07b-dbdfdd7d1ec8	YES	48.880000000	1.002400000	2025-10-27 00:50:41.722347	2025-10-27 00:50:41.722347
26565b80-f3fb-41ce-bf07-fbc6938ef2c2	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	947.680000000	1.034100000	2025-10-29 01:38:38.69574	2025-10-29 01:38:53.572
1e7abc5a-14e4-4a6b-9001-2c83d701df9a	b03668e6-821a-4e06-b541-1cd2e0ea45af	d34373d6-1998-4d30-ad8b-86693941de64	YES	97.520000000	1.004900000	2025-10-29 01:41:46.173925	2025-10-29 01:41:46.173925
24b0ed71-e095-487e-b132-e0b21afeb9c3	7f0a9138-5a4d-4955-8895-dc27436f10b2	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	9.030000000	1.085700000	2025-10-29 01:44:09.135858	2025-10-29 01:44:09.135858
159447c4-bbaa-4b67-a298-8c216463ed34	00772767-41bc-4967-8266-5541d53b105e	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	1012.730000000	0.967700000	2025-10-29 01:47:44.804567	2025-10-29 01:47:44.804567
44927dc7-5732-4310-9c61-ecf0120ae67e	2a5a8384-d652-42e3-bed1-b03545d35725	c9eb1e87-a44c-484f-8e64-8aadee6c06bf	YES	889.580000000	1.046600000	2025-10-27 02:06:53.043818	2025-10-27 02:07:46.155
ac56ee30-9844-4fcb-a302-72b68c0823a4	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	9eddb4ed-8e10-48e7-abf3-3621f24319bb	YES	478.280000000	1.024500000	2025-10-27 15:49:33.474765	2025-10-27 15:49:33.474765
d8d8c5c1-fa88-4778-9625-a80ae73a3318	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	11e1fe6c-07dc-4463-a338-de6f7bab83aa	YES	478.280000000	1.024500000	2025-10-27 15:56:23.733394	2025-10-27 15:56:23.733394
09421189-844c-4356-bbfa-a341fe3e5ce0	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	92.920000000	1.054600000	2025-10-27 16:26:45.713959	2025-10-27 16:26:45.713959
1da2633a-7a17-4d1b-939c-cdb0dc2238e2	72e306d2-207c-462c-9415-a0c7aa96a2ab	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	929.940000000	1.053800000	2025-10-27 16:26:30.19125	2025-10-27 16:27:03.993
523447ea-ff79-4e87-8a4a-96b8dbf8b77d	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	f934ac20-c4c3-4fb1-8c54-35ea539f7cad	NO	843.120000000	1.162300000	2025-10-27 16:27:29.312988	2025-10-27 16:27:37.241
8b40e4c6-1271-41a5-a883-809645bf4f1e	9834faee-2e62-43c4-8bdf-e8a48c024bd0	621f98b0-89ea-49de-8d53-e80a7df36042	YES	97.520000000	1.004900000	2025-10-29 00:13:26.274596	2025-10-29 00:13:26.274596
2febd29a-3c05-4a6e-8239-74a0c4994294	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	97.520000000	1.004900000	2025-10-29 00:14:17.125869	2025-10-29 00:14:17.125869
73c1505d-e214-416f-8984-52d4cf32b31c	d8c125df-fb1f-4755-9975-1e23ffdd006a	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	9.800000000	1.000500000	2025-10-29 00:15:27.628916	2025-10-29 00:15:27.628916
ddf29bfe-3412-4de3-9c0a-53e1112556ad	8903720d-1010-4477-a548-0fa98558c462	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	48.880000000	1.002400000	2025-10-29 00:31:21.550961	2025-10-29 00:31:21.550961
0fe8caa2-106e-4cfe-97f5-21950edc2ba9	2cebf2a9-8cd9-41e2-8a76-357570839646	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	9.800000000	1.000500000	2025-10-29 00:32:42.119324	2025-10-29 00:32:42.119324
4a1cdf84-a834-4847-bda4-32d2effd5e5e	8903720d-1010-4477-a548-0fa98558c462	af62438b-0dfd-4b7e-921a-c65249b9514b	YES	48.880000000	1.002400000	2025-10-29 00:33:18.874206	2025-10-29 00:33:18.874206
0305d38b-fe7f-4734-8434-4270c16de9ad	8903720d-1010-4477-a548-0fa98558c462	5ad16a19-1481-47b8-a791-69b314373c90	YES	48.880000000	1.002400000	2025-10-29 00:33:27.801152	2025-10-29 00:33:27.801152
54cd94e7-c967-491f-8886-2993381dd20b	8903720d-1010-4477-a548-0fa98558c462	ef4592dd-1cc6-4da6-80ad-c185d04b83e8	YES	97.520000000	1.004900000	2025-10-29 00:33:42.31956	2025-10-29 00:33:42.31956
a0389e07-fb1d-4f39-a066-230b107f78bd	8903720d-1010-4477-a548-0fa98558c462	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	145.930000000	1.007300000	2025-10-29 00:31:45.16686	2025-10-29 00:36:51.666
e7a4a3b6-225c-48e9-8cda-a456cd04eb8c	8903720d-1010-4477-a548-0fa98558c462	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	YES	194.100000000	1.009800000	2025-10-29 00:32:43.583584	2025-10-29 00:37:07.249
c2054e14-741c-44d8-b3f7-73682439aa3d	c694679a-47f2-416e-8e5f-34735fba5715	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	9.800000000	1.000500000	2025-10-29 00:43:08.966572	2025-10-29 00:43:08.966572
04717d8f-995a-43fa-951d-aeddd185d261	c694679a-47f2-416e-8e5f-34735fba5715	de9f0b13-259c-495c-8497-072ec8d45331	YES	9.800000000	1.000500000	2025-10-29 00:43:40.574957	2025-10-29 00:43:40.574957
d90d38f0-dc32-4470-975d-bdcf6842fafc	c694679a-47f2-416e-8e5f-34735fba5715	d56f2224-6c29-4110-8330-33dec782a2e2	YES	478.280000000	1.024500000	2025-10-29 00:43:51.413699	2025-10-29 00:43:51.413699
9439beff-3a15-4f93-ae99-69ac7d5cc60a	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	48.880000000	1.002400000	2025-10-29 00:45:04.803493	2025-10-29 00:45:04.803493
f8a13f6c-0d84-4250-b8c3-4ffa3f65701d	47887516-721e-4369-9fb0-918c63bb8227	696b7e3f-44bb-408f-b490-482f4fb7bcc2	NO	933.330000000	1.049000000	2025-10-29 00:52:13.88472	2025-10-29 00:52:13.88472
defa2ee3-b107-41f9-be4e-7685172c12f4	4a6a595c-f247-4f53-a589-e606cc428bc1	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	97.520000000	1.004900000	2025-10-29 00:56:47.384946	2025-10-29 00:56:47.384946
318cd9b6-70e8-47d8-a065-68374bded758	769a0aa2-9ce2-4a09-8efb-697727a78239	d56f2224-6c29-4110-8330-33dec782a2e2	YES	9.330000000	1.050100000	2025-10-29 00:59:34.444556	2025-10-29 00:59:34.444556
0edb8159-5ee5-40c9-b922-01310da072e6	4a6a595c-f247-4f53-a589-e606cc428bc1	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	473.680000000	1.034400000	2025-10-29 01:04:16.062373	2025-10-29 01:04:16.062373
91a94e3d-870a-4933-917d-3e9abc22459c	088deaa4-8a69-4d01-ac4c-a00a67444efc	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	48.930000000	1.001500000	2025-10-29 01:05:47.252577	2025-10-29 01:05:47.252577
ce041d5a-a5c5-41d6-837d-578eeeb5f5ab	30505fa7-dbbb-45c9-b704-5498b6ce730d	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.760000000	1.004400000	2025-10-29 01:12:22.113134	2025-10-29 01:12:22.113134
1514b226-2497-4288-9bdb-429eaf263c72	01289b67-bc83-469e-99a1-356102efe0fd	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	475.970000000	1.029500000	2025-10-29 01:17:16.311129	2025-10-29 01:17:16.311129
8931c364-b4b6-4495-8c5a-07e01d2d46eb	ce45f9ea-0146-431f-9469-15e31de21981	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.290000000	1.055100000	2025-10-29 01:37:15.866343	2025-10-29 01:37:15.866343
555f30ef-7fc7-47c3-b512-6ca4f4dc5eb4	aec40e30-e922-4f47-8552-c07c08a12e9a	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.280000000	1.056100000	2025-10-29 01:37:23.221561	2025-10-29 01:37:23.221561
ca7860e9-cd07-424d-83ba-f84f36797901	bdefc13e-f3e5-49a2-b749-4aa864027d42	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.270000000	1.057100000	2025-10-29 01:48:48.788353	2025-10-29 01:48:48.788353
b0127aa5-351d-41bf-b596-19fc9b79a08f	0238327d-15b3-41ae-b52c-cf223ee9832c	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	0.000000000	1.009800000	2025-10-29 01:48:29.78099	2025-10-29 01:49:55.283
489f46a5-dd89-4adb-a338-2ef779d05761	0238327d-15b3-41ae-b52c-cf223ee9832c	36d4b50a-987e-4b93-864b-aca00db121f7	YES	0.000000000	1.004900000	2025-10-29 01:49:06.944401	2025-10-29 01:51:07.313
97ba7464-400e-4ae1-ac94-2b24f5dfcc07	0238327d-15b3-41ae-b52c-cf223ee9832c	e6ce6e2c-77ed-4fd4-9687-23b604290619	YES	0.000000000	1.004900000	2025-10-29 01:49:14.429885	2025-10-29 01:51:21.296
44a865bb-6770-439d-a8bf-a498032e0f82	0238327d-15b3-41ae-b52c-cf223ee9832c	621f98b0-89ea-49de-8d53-e80a7df36042	YES	0.000000000	1.014700000	2025-10-29 01:49:20.604877	2025-10-29 01:51:27.579
db6ce7f2-f9e6-4c38-885e-292e1679420b	5cdda325-1f54-42bc-b1d1-7479913fc3f5	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	95.890000000	1.022000000	2025-10-29 01:51:48.152298	2025-10-29 01:51:48.152298
3a4017bb-2fbe-4c52-b080-69904b44c47e	0238327d-15b3-41ae-b52c-cf223ee9832c	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	807.200000000	1.070800000	2025-10-29 01:52:04.206533	2025-10-29 01:52:04.206533
a4423fd8-aa51-424d-bafa-d7a7c74294aa	0238327d-15b3-41ae-b52c-cf223ee9832c	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	0.000000000	1.005900000	2025-10-29 01:48:44.873284	2025-10-29 01:52:16.13
9df2b28e-d9ff-4df1-9874-6f66420ab329	0238327d-15b3-41ae-b52c-cf223ee9832c	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	96.050000000	0.999900000	2025-10-29 01:48:54.558174	2025-10-29 01:52:39.097
144f0172-24d2-4727-9c76-6f14afef5534	c37781bb-d03a-4b8f-aa8b-972ee268014a	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	145.780000000	1.008300000	2025-10-29 01:56:01.419563	2025-10-29 01:56:21.792
707fcc65-ab7d-4736-8046-425b9ed28bbb	b03668e6-821a-4e06-b541-1cd2e0ea45af	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	87.370000000	1.121700000	2025-10-29 01:58:20.453376	2025-10-29 01:58:20.453376
5438e37b-25d1-45d0-ae86-8592d637873a	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	97.520000000	1.004900000	2025-10-29 02:05:41.935751	2025-10-29 02:05:41.935751
1020ec2c-ab26-4dbc-97d9-2029dac160df	411dc4b0-c7f6-44ba-a7cd-dab215760984	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	96.010000000	1.020700000	2025-10-29 02:12:46.40777	2025-10-29 02:12:46.40777
c40e560a-3a25-48e5-830e-5de93bf93af2	d6f78f80-b222-49b8-9412-eea692bcaa34	d30c9b38-20d5-4921-9666-2efdd14c2a6a	NO	48.880000000	1.002400000	2025-10-29 02:17:37.580396	2025-10-29 02:17:37.580396
9a62b480-6188-4e73-88fc-358f9764ac37	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	48.650000000	1.007200000	2025-10-29 02:04:20.774704	2025-10-29 02:04:20.774704
1804bf2b-67e8-4cba-b9f9-7c789a8de4d7	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	8.690000000	1.127400000	2025-10-29 02:15:40.410953	2025-10-29 02:15:40.410953
993e86d5-f756-44e5-93d1-271d2ba9babc	d6f78f80-b222-49b8-9412-eea692bcaa34	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	505.510000000	0.969300000	2025-10-29 02:18:18.731778	2025-10-29 02:18:18.731778
04905133-e18f-408c-ba6e-6fbd733b018f	d6f78f80-b222-49b8-9412-eea692bcaa34	d5812241-a74a-4d80-81d3-eab0c8af3b5b	YES	431.490000000	1.022000000	2025-10-29 02:18:38.334634	2025-10-29 02:18:38.334634
677d6277-dd0c-446e-94d9-296ca21966e5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	9.740000000	1.006400000	2025-10-29 02:30:39.809856	2025-10-29 02:30:39.809856
3324e57d-979f-4d16-a78f-8f331da0c45f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	9.240000000	1.060200000	2025-10-29 02:38:30.525284	2025-10-29 02:38:30.525284
8a4f728e-7b6c-42b9-ab92-9688cdaee212	e5275105-2102-4d2c-afda-0440b7afaab3	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	451.240000000	1.085900000	2025-10-29 02:39:03.856728	2025-10-29 02:39:03.856728
071f1aec-050e-43e8-ad0d-91276c1f03a1	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	6018a059-bdde-4605-8636-8c8ab7fadd6e	YES	9.800000000	1.000500000	2025-10-29 02:39:26.244826	2025-10-29 02:39:26.244826
83d3cd6a-94e9-49c1-ad08-b36489690c86	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	20250d49-1b4b-4096-a17c-6a6de8e21747	YES	9.800000000	1.000500000	2025-10-29 02:39:31.156751	2025-10-29 02:39:31.156751
9f037e6b-f8d2-48a4-8c73-eed7c6843447	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	41.680000000	1.011600000	2025-10-29 02:38:08.463138	2025-10-29 02:47:30.927
08d35f09-d4d6-4f3d-816d-c29b50fc3e4f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	de9f0b13-259c-495c-8497-072ec8d45331	YES	51.730000000	1.003800000	2025-10-29 02:38:01.783617	2025-10-29 02:47:43.938
403c8c29-455c-4d53-ae06-2d2f547419c4	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	424.640000000	1.153900000	2025-10-29 02:28:20.593715	2025-10-29 02:28:20.593715
f317d0e0-24f5-4659-9adc-24bc29890fcf	d3e4a456-7bbd-461c-8806-50dee853d118	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	481.530000000	1.017600000	2025-10-29 02:31:20.708527	2025-10-29 02:31:20.708527
7bafe514-4e39-4f6d-89b6-b454cefea262	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	9.400000000	1.043100000	2025-10-29 02:31:47.951662	2025-10-29 02:31:47.951662
0cca9378-4cd6-4afd-ac00-40c6ab86d83c	37ed79db-51d0-4907-aa94-75502fa74c5e	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	473.680000000	1.034400000	2025-10-29 02:32:52.713846	2025-10-29 02:32:52.713846
88b82840-a431-44ac-aee7-551fee7c1024	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	57.160000000	1.028600000	2025-10-29 02:37:53.363274	2025-10-29 02:38:12.981
a47c952a-4bb0-4f05-8f16-207158025df0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.730000000	1.006800000	2025-10-29 02:38:22.077941	2025-10-29 02:38:22.077941
d6e9164b-a04e-46f7-be3c-120a290b95db	e5275105-2102-4d2c-afda-0440b7afaab3	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	NO	10.380000000	0.944200000	2025-10-29 02:38:30.903863	2025-10-29 02:38:30.903863
e2f36f9f-6e5b-4a19-b42a-58618f6826ee	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d56f2224-6c29-4110-8330-33dec782a2e2	YES	1.250000000	1.053700000	2025-10-29 02:38:42.968787	2025-10-29 02:47:43.418
4ccee4c9-c418-4f12-86f3-c74b9867f261	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	9.750000000	1.005400000	2025-10-29 02:38:42.663786	2025-10-29 02:38:42.663786
15da49d5-d5d8-45d4-8da8-b351cff1f5e5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	c05312e8-40bf-42a8-a95e-443f391f6045	YES	9.800000000	1.000500000	2025-10-29 02:38:48.366727	2025-10-29 02:38:48.366727
19233f91-239c-4368-90be-3774ea06ff99	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	5877484f-f8a2-41b8-8889-7bac69f1c993	YES	9.800000000	1.000500000	2025-10-29 02:38:54.011747	2025-10-29 02:38:54.011747
c4af90f4-9d23-4d1e-9969-26c2aa80a642	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	9.800000000	1.000500000	2025-10-29 02:39:00.292238	2025-10-29 02:39:00.292238
09940000-e944-4dd7-a32d-cc3959580615	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ad076954-b6fe-487f-aa79-8c2cbfdb62e4	YES	9.800000000	1.000500000	2025-10-29 02:39:04.521937	2025-10-29 02:39:04.521937
fc5cbd27-ea19-4250-bf2f-b38b33821b62	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	YES	9.800000000	1.000500000	2025-10-29 02:39:15.949062	2025-10-29 02:39:15.949062
54efb57c-5dec-4352-800a-d8dbb819a109	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e2671622-4131-4733-8176-eb9c27780278	YES	9.800000000	1.000500000	2025-10-29 02:39:16.166736	2025-10-29 02:39:16.166736
29f96990-1eb7-4537-a9c5-9ddae0f168a1	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	9.800000000	1.000500000	2025-10-29 02:39:22.905832	2025-10-29 02:39:22.905832
d2c413cf-4593-425f-88f6-f22637cbf8fd	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	91c019e2-7233-495a-988a-8d4c7cdccd2b	YES	9.800000000	1.000500000	2025-10-29 02:39:25.490282	2025-10-29 02:39:25.490282
cd27a27b-5af9-4cb2-8f7f-78504b54a60a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ae59057f-cbc0-4ee4-b623-257f78296ba4	YES	9.800000000	1.000500000	2025-10-29 02:39:38.866056	2025-10-29 02:39:38.866056
d550c612-7d41-4601-acef-ea049e931688	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	ef4592dd-1cc6-4da6-80ad-c185d04b83e8	YES	48.410000000	1.012300000	2025-10-29 02:39:52.451324	2025-10-29 02:39:52.451324
0791decd-dae5-42c8-9246-1af3bf21058a	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	696b7e3f-44bb-408f-b490-482f4fb7bcc2	YES	53.780000000	0.911200000	2025-10-29 02:40:10.201303	2025-10-29 02:40:10.201303
26c77e1b-a101-4245-a2b6-5e0404bc18c6	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	d34373d6-1998-4d30-ad8b-86693941de64	YES	48.410000000	1.012300000	2025-10-29 02:40:10.295179	2025-10-29 02:40:10.295179
234d0b86-4036-4c7f-a705-64ba6078145f	e5275105-2102-4d2c-afda-0440b7afaab3	9461bb3d-c43e-445d-b561-8e5a4a9cea87	NO	98.230000000	0.997700000	2025-10-29 02:40:21.322139	2025-10-29 02:40:21.322139
adcc9cce-496c-4c19-a451-5151f2b37199	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	0ae16313-0efe-4dd3-bc92-ca8bf2246903	YES	48.880000000	1.002400000	2025-10-29 02:40:36.087302	2025-10-29 02:40:36.087302
c10cf38d-46cc-4c02-b7ce-8a5329baf0c3	e5275105-2102-4d2c-afda-0440b7afaab3	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	94.540000000	1.036600000	2025-10-29 02:40:36.698565	2025-10-29 02:40:36.698565
a1040564-8177-4a88-b26a-1e92eddbe21f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	34a0781e-cde7-4eec-ac89-fdad71893214	YES	48.880000000	1.002400000	2025-10-29 02:40:40.445071	2025-10-29 02:40:40.445071
2b957e2b-2666-4ac3-bc30-6617f97a7d8f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	5b4c6405-94b6-4e20-a87b-c5ec6256786f	YES	9.800000000	1.000500000	2025-10-29 02:40:40.56623	2025-10-29 02:40:40.56623
84c44a21-8b18-46af-bbb1-3407d0a11b33	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	e1564a37-b27e-4380-a2b2-8054ff5ac4e3	YES	9.800000000	1.000500000	2025-10-29 02:40:46.62027	2025-10-29 02:40:46.62027
708b5423-cb89-4ae1-ba33-9b760c05ade0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	15fef1cb-7d54-4348-9005-4512771e0ba1	YES	9.800000000	1.000500000	2025-10-29 02:40:46.63494	2025-10-29 02:40:46.63494
a9f4a55f-4d34-46c6-96b2-96324fa62cab	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	6e5fd4b5-651b-482b-a6b9-36f7cdf769ba	YES	9.800000000	1.000500000	2025-10-29 02:40:47.42185	2025-10-29 02:40:47.42185
c3758f32-dd84-4d05-9fd9-f3e0ad67f8b0	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	962fec63-4816-4bbb-9970-3f002fb86e02	YES	9.800000000	1.000500000	2025-10-29 02:40:47.614496	2025-10-29 02:40:47.614496
6c5d8758-26f5-4cbd-a580-7fbc67222ca6	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	7a6658de-1c31-445c-90e0-370fc3977773	YES	48.880000000	1.002400000	2025-10-29 02:40:52.236433	2025-10-29 02:40:52.236433
d07b7018-72fd-46b1-94d8-e608d143b162	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	18b3c5bd-541a-4ab9-bb77-a92510f6808a	YES	48.880000000	1.002400000	2025-10-29 02:40:52.355664	2025-10-29 02:40:52.355664
b03b1839-2118-47f4-9a8e-06e9a3446676	116eace9-841b-48fa-a7ec-d3249bb3aa80	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	8.280000000	1.183300000	2025-10-29 02:43:14.632497	2025-10-29 02:43:14.632497
6b27c74c-6e83-4fa8-a992-8ca81ce6b31f	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	19.760000000	1.041900000	2025-10-29 02:37:45.02125	2025-10-29 02:47:26.075
9c4860b2-a210-40cf-99b2-c5e5e031867a	e5275105-2102-4d2c-afda-0440b7afaab3	5ad16a19-1481-47b8-a791-69b314373c90	NO	49.120000000	0.997600000	2025-10-29 02:42:05.702956	2025-10-29 02:42:05.702956
c24d270e-56be-4929-98c3-41a408ee16df	e5275105-2102-4d2c-afda-0440b7afaab3	c05312e8-40bf-42a8-a95e-443f391f6045	YES	97.430000000	1.005900000	2025-10-29 02:42:50.701701	2025-10-29 02:42:50.701701
4b4840d0-c43d-4066-b1e7-4f4bc05a98b1	898e8852-e40d-4b2a-a8f7-3e215268febc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	98.960000000	0.990300000	2025-10-29 02:43:30.676396	2025-10-29 02:43:30.676396
950e63a3-6742-40fe-8c69-67c270058f06	116eace9-841b-48fa-a7ec-d3249bb3aa80	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	9.400000000	1.042100000	2025-10-29 02:43:38.343885	2025-10-29 02:43:38.343885
09af15bc-2f5d-49f4-bef4-0e1a2b344055	116eace9-841b-48fa-a7ec-d3249bb3aa80	de9f0b13-259c-495c-8497-072ec8d45331	YES	9.740000000	1.006600000	2025-10-29 02:43:41.141016	2025-10-29 02:43:41.141016
37bad32f-e3ad-4a01-a612-ebff74515529	116eace9-841b-48fa-a7ec-d3249bb3aa80	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	51.110000000	0.958800000	2025-10-29 02:43:50.340425	2025-10-29 02:43:50.340425
6e94a219-f16f-492d-81ab-720ca794025e	116eace9-841b-48fa-a7ec-d3249bb3aa80	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	531.030000000	0.922700000	2025-10-29 02:44:03.097651	2025-10-29 02:44:03.097651
7d6c2607-55bb-454f-b311-56acc888c7c0	e5275105-2102-4d2c-afda-0440b7afaab3	de9f0b13-259c-495c-8497-072ec8d45331	YES	48.540000000	1.009500000	2025-10-29 02:44:37.577165	2025-10-29 02:44:37.577165
eabd7f45-d2d7-4f6c-b0e8-87193486b758	7c7bb616-dc44-412d-b05f-2c34fc58929b	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	483.600000000	1.215900000	2025-10-29 02:46:47.713461	2025-10-29 02:48:36.12
1323ae72-dfcb-4ad0-bd08-fa9ab59d8422	116eace9-841b-48fa-a7ec-d3249bb3aa80	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	400.500000000	1.027700000	2025-10-29 02:43:22.664449	2025-10-29 02:52:44.899
0e20c138-8731-4af7-afca-515fdabbc81e	e5275105-2102-4d2c-afda-0440b7afaab3	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	9.750000000	1.005300000	2025-10-29 02:44:45.623662	2025-10-29 02:44:45.623662
ae462d4b-0ba9-4e8e-8b9f-5ff57df3fb98	7c7bb616-dc44-412d-b05f-2c34fc58929b	de9f0b13-259c-495c-8497-072ec8d45331	YES	96.370000000	1.016900000	2025-10-29 02:47:36.570588	2025-10-29 02:47:36.570588
08d93e0b-1938-4bb6-9e40-0ef3b518b0ca	781a2101-8dfc-480e-a185-69fab61df3cc	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	24.290000000	1.250700000	2025-10-29 02:48:54.628489	2025-10-29 02:54:52.599
5499c6f2-a5e3-41e0-89ae-04daf5054d61	781a2101-8dfc-480e-a185-69fab61df3cc	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	10.190000000	1.058200000	2025-10-29 02:49:15.257907	2025-10-29 02:55:00.801
cf3dc428-a2d4-48cd-bd47-b6dfa363346a	781a2101-8dfc-480e-a185-69fab61df3cc	de9f0b13-259c-495c-8497-072ec8d45331	YES	31.550000000	1.025400000	2025-10-29 02:48:42.783887	2025-10-29 02:55:21.524
4874b56a-73b0-4da8-8165-7d7fea96027a	e5275105-2102-4d2c-afda-0440b7afaab3	d56f2224-6c29-4110-8330-33dec782a2e2	NO	10.300000000	0.951400000	2025-10-29 02:45:08.004963	2025-10-29 02:45:08.004963
4d192da5-a788-4b4f-b889-74d239b15e59	781a2101-8dfc-480e-a185-69fab61df3cc	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	11.090000000	1.060000000	2025-10-29 02:49:27.472838	2025-10-29 02:55:13.358
1e727567-b4f9-45cc-a32d-b2397fac583e	e5275105-2102-4d2c-afda-0440b7afaab3	36d4b50a-987e-4b93-864b-aca00db121f7	YES	68.370000000	1.003400000	2025-10-29 02:42:28.150852	2025-10-29 02:45:22.617
09eacb66-3357-44e0-8e33-5e50da62887d	898e8852-e40d-4b2a-a8f7-3e215268febc	41efe570-c5e6-4f03-a3a9-003e1c80db46	NO	546.190000000	0.986800000	2025-10-29 01:57:52.644509	2025-10-29 02:46:36.663
1f0e4c42-fae0-4989-b5aa-94ab900a72f5	7c7bb616-dc44-412d-b05f-2c34fc58929b	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	92.320000000	1.061500000	2025-10-29 02:47:03.225692	2025-10-29 02:47:03.225692
1affec45-53b2-48d0-ad3e-b16699164b6a	7c7bb616-dc44-412d-b05f-2c34fc58929b	d56f2224-6c29-4110-8330-33dec782a2e2	YES	46.570000000	1.052100000	2025-10-29 02:47:28.019215	2025-10-29 02:47:28.019215
21b2d17d-ad57-4a5a-b543-3ce92b74f285	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	19.790000000	1.188400000	2025-10-29 02:38:18.269539	2025-10-29 02:47:38.062
3dcfa5de-5ec5-4964-be24-b209f500190b	7c7bb616-dc44-412d-b05f-2c34fc58929b	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	139.990000000	1.050100000	2025-10-29 02:46:24.62101	2025-10-29 02:48:48.477
3566583d-ad80-4360-b440-14de62958576	781a2101-8dfc-480e-a185-69fab61df3cc	5eb75da5-3e9c-4ddf-a60a-8960dccb0ea0	YES	9.800000000	1.000500000	2025-10-29 02:49:24.90129	2025-10-29 02:49:24.90129
1c25ce3d-d25d-4be7-a650-7c2a21382dd1	781a2101-8dfc-480e-a185-69fab61df3cc	d56f2224-6c29-4110-8330-33dec782a2e2	YES	27.840000000	1.056200000	2025-10-29 02:48:36.235814	2025-10-29 02:50:30.355
173cfa87-beba-419b-a0a7-b304c85481dc	781a2101-8dfc-480e-a185-69fab61df3cc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	29.370000000	1.068200000	2025-10-29 02:48:40.056299	2025-10-29 02:55:24.044
cea37486-9d19-4736-a9eb-a65c95ccdcc3	781a2101-8dfc-480e-a185-69fab61df3cc	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	21.330000000	1.010600000	2025-10-29 02:49:01.451543	2025-10-29 02:54:45.249
0d6b1ade-ddbe-4946-a5af-93dbf54c3dbb	781a2101-8dfc-480e-a185-69fab61df3cc	d827611b-bd78-4f00-a05c-b68859aefca5	YES	10.780000000	1.000500000	2025-10-29 02:49:22.136738	2025-10-29 02:55:29.392
20a63ad6-4b14-4295-bb31-292a6854d24d	781a2101-8dfc-480e-a185-69fab61df3cc	696b7e3f-44bb-408f-b490-482f4fb7bcc2	YES	10.720000000	0.914000000	2025-10-29 02:49:28.326021	2025-10-29 02:49:28.326021
c4c2c4f8-9e41-432e-89ef-1a1d5756319a	781a2101-8dfc-480e-a185-69fab61df3cc	5877484f-f8a2-41b8-8889-7bac69f1c993	YES	9.790000000	1.001500000	2025-10-29 02:49:52.057517	2025-10-29 02:49:52.057517
495e380e-5a94-4106-833b-94472ff02169	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	46.130000000	1.062100000	2025-10-29 02:50:44.61822	2025-10-29 02:50:44.61822
326db1cc-57d3-4b88-ad2c-9938386b744c	781a2101-8dfc-480e-a185-69fab61df3cc	0fcc2a8f-26ac-4a56-823d-ee054a6b2bf4	YES	9.610000000	1.020200000	2025-10-29 02:50:53.391634	2025-10-29 02:50:53.391634
fb0dbe57-a0ad-44ae-b6db-a366f4012574	781a2101-8dfc-480e-a185-69fab61df3cc	af62438b-0dfd-4b7e-921a-c65249b9514b	YES	9.750000000	1.005400000	2025-10-29 02:50:56.701975	2025-10-29 02:50:56.701975
42a4e1b2-6551-43aa-815e-68e41b4ed806	781a2101-8dfc-480e-a185-69fab61df3cc	51fbe44c-ea10-43ad-ab46-37722bbe1409	YES	9.800000000	1.000500000	2025-10-29 02:51:00.241611	2025-10-29 02:51:00.241611
089f9bee-fa3c-4a02-9dee-553df8f811f7	781a2101-8dfc-480e-a185-69fab61df3cc	ae59057f-cbc0-4ee4-b623-257f78296ba4	YES	9.790000000	1.001500000	2025-10-29 02:51:02.371214	2025-10-29 02:51:02.371214
381e1773-7804-4b67-90e7-61b8f68040c7	781a2101-8dfc-480e-a185-69fab61df3cc	9461bb3d-c43e-445d-b561-8e5a4a9cea87	YES	9.820000000	0.997900000	2025-10-29 02:51:04.938262	2025-10-29 02:51:04.938262
6e82c35e-e8b6-4377-aeca-e5bf0a66f99f	781a2101-8dfc-480e-a185-69fab61df3cc	e6ce6e2c-77ed-4fd4-9687-23b604290619	YES	9.800000000	1.000500000	2025-10-29 02:51:07.383918	2025-10-29 02:51:07.383918
c737b1f8-c3bd-44a5-91a6-661e248e3b6a	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	48.360000000	1.013300000	2025-10-29 02:51:09.403429	2025-10-29 02:51:09.403429
5f4eccbc-819a-4a22-a152-b07335f39356	781a2101-8dfc-480e-a185-69fab61df3cc	12234807-e884-47ca-bf2c-e96e2d3ab1b4	YES	9.800000000	1.000500000	2025-10-29 02:51:10.90737	2025-10-29 02:51:10.90737
36cb953c-0fce-4539-8e06-a7fd16fa0f10	781a2101-8dfc-480e-a185-69fab61df3cc	153ca650-c833-4e43-8821-9df7b757ec29	YES	9.800000000	1.000500000	2025-10-29 02:51:14.913413	2025-10-29 02:51:14.913413
04166d89-40aa-4ecb-9a86-1a997f87461d	781a2101-8dfc-480e-a185-69fab61df3cc	621f98b0-89ea-49de-8d53-e80a7df36042	YES	9.700000000	1.010300000	2025-10-29 02:51:18.456451	2025-10-29 02:51:18.456451
8d91a16e-48fb-4507-abb3-55185e25b3ed	781a2101-8dfc-480e-a185-69fab61df3cc	0ae16313-0efe-4dd3-bc92-ca8bf2246903	YES	9.750000000	1.005400000	2025-10-29 02:51:23.697983	2025-10-29 02:51:23.697983
7c575ceb-af8a-4f2e-8d55-ddf8cdc1abbc	781a2101-8dfc-480e-a185-69fab61df3cc	34a0781e-cde7-4eec-ac89-fdad71893214	YES	9.750000000	1.005400000	2025-10-29 02:51:26.274625	2025-10-29 02:51:26.274625
edd08d62-c56a-4848-aba0-76ff527245e0	781a2101-8dfc-480e-a185-69fab61df3cc	5b4c6405-94b6-4e20-a87b-c5ec6256786f	YES	9.790000000	1.001500000	2025-10-29 02:51:29.10093	2025-10-29 02:51:29.10093
fa4819bb-4d48-42d0-a343-7fc1d3553537	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	e1564a37-b27e-4380-a2b2-8054ff5ac4e3	NO	97.620000000	1.003900000	2025-10-29 02:51:46.416321	2025-10-29 02:51:46.416321
054c203b-f0c1-4b7a-a3c5-b8a391f6f8bf	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	0ae16313-0efe-4dd3-bc92-ca8bf2246903	NO	98.100000000	0.999000000	2025-10-29 02:52:21.019953	2025-10-29 02:52:21.019953
5b5fe226-7d17-4414-9c90-500b541dcf6b	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	481.930000000	1.016700000	2025-10-29 02:52:33.881304	2025-10-29 02:52:33.881304
9cd315b8-15e8-469c-a40f-252d674801d2	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	de9f0b13-259c-495c-8497-072ec8d45331	YES	189.400000000	1.034900000	2025-10-29 02:52:49.02087	2025-10-29 02:52:49.02087
79806588-c3c5-4147-b1a4-bc843fe1067d	781a2101-8dfc-480e-a185-69fab61df3cc	76909b2b-a9dd-41e2-a424-b01cdd5d2b8b	YES	0.980000000	1.001000000	2025-10-29 02:56:15.873454	2025-10-29 02:56:15.873454
494fcca2-9473-4b34-be05-32354dcbd312	c37781bb-d03a-4b8f-aa8b-972ee268014a	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	93.610000000	1.046800000	2025-10-29 02:54:16.643174	2025-10-29 02:54:16.643174
8abd0dc0-83c9-4fb4-8aa5-289fe231e0ab	c37781bb-d03a-4b8f-aa8b-972ee268014a	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	49.220000000	0.995600000	2025-10-29 02:54:26.243662	2025-10-29 02:54:26.243662
e14242fc-e209-4d3d-b20a-bc0fa3230aea	781a2101-8dfc-480e-a185-69fab61df3cc	d5812241-a74a-4d80-81d3-eab0c8af3b5b	YES	10.320000000	1.045100000	2025-10-29 02:49:46.462936	2025-10-29 02:55:47.413
b062d203-a03d-4505-b21d-caab9a97980c	6b9280e2-476c-430b-9470-05ee75118ac6	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	48.830000000	1.003400000	2025-10-29 03:00:53.175139	2025-10-29 03:00:53.175139
5ac4d93e-ea18-43f3-99c9-cf54ab90eff7	c37781bb-d03a-4b8f-aa8b-972ee268014a	d56f2224-6c29-4110-8330-33dec782a2e2	YES	452.480000000	1.082900000	2025-10-29 02:54:37.04328	2025-10-29 02:54:37.04328
7a8a6d08-0145-49bd-a068-81120556676c	781a2101-8dfc-480e-a185-69fab61df3cc	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	22.570000000	0.998500000	2025-10-29 02:49:05.013264	2025-10-29 02:54:49.498
7e275e09-7100-4928-83f7-f8afbae19ace	c37781bb-d03a-4b8f-aa8b-972ee268014a	c05312e8-40bf-42a8-a95e-443f391f6045	YES	48.310000000	1.014300000	2025-10-29 02:54:58.62236	2025-10-29 02:54:58.62236
caeee7f5-5427-426b-8fd2-790d70be952f	781a2101-8dfc-480e-a185-69fab61df3cc	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	11.700000000	1.005700000	2025-10-29 02:49:12.672837	2025-10-29 02:55:06.888
8b7bdcbc-849b-4fa1-8422-51eddea0db9b	781a2101-8dfc-480e-a185-69fab61df3cc	d34373d6-1998-4d30-ad8b-86693941de64	YES	10.610000000	1.015300000	2025-10-29 02:49:36.897707	2025-10-29 02:55:24.458
e84055e7-6d04-4222-8242-ad1385c52a42	781a2101-8dfc-480e-a185-69fab61df3cc	ad076954-b6fe-487f-aa79-8c2cbfdb62e4	YES	0.980000000	1.001000000	2025-10-29 02:56:18.632244	2025-10-29 02:56:18.632244
3b82e982-a895-47fa-9dd8-2559c3e180b9	781a2101-8dfc-480e-a185-69fab61df3cc	5ad16a19-1481-47b8-a791-69b314373c90	YES	10.780000000	1.000500000	2025-10-29 02:49:34.213918	2025-10-29 02:55:39.687
7c070fbd-babd-41b7-9d2f-7935e68d85c7	781a2101-8dfc-480e-a185-69fab61df3cc	36d4b50a-987e-4b93-864b-aca00db121f7	YES	11.670000000	1.007500000	2025-10-29 02:50:04.64338	2025-10-29 02:56:21.231
b6d5d72a-c1b0-4ef6-8183-8508d627f4f3	781a2101-8dfc-480e-a185-69fab61df3cc	c05312e8-40bf-42a8-a95e-443f391f6045	YES	11.610000000	1.012200000	2025-10-29 02:49:40.658939	2025-10-29 02:55:59.975
432bd3d7-cbc8-4b7e-8e58-dbe8c4a9394d	781a2101-8dfc-480e-a185-69fab61df3cc	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	10.770000000	1.001500000	2025-10-29 02:49:49.896926	2025-10-29 02:56:04.257
9bd1fc2b-cbec-437d-a5e1-207b60f21975	781a2101-8dfc-480e-a185-69fab61df3cc	f67f7d2b-c321-4b2f-9fb2-5c0ceb9e36a0	YES	10.660000000	1.010800000	2025-10-29 02:49:31.293978	2025-10-29 02:56:07.847
4aabb616-1d75-447b-8057-0d9895faa8d1	781a2101-8dfc-480e-a185-69fab61df3cc	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	12.780000000	0.995700000	2025-10-29 02:49:42.876453	2025-10-29 02:56:10.396
1d2f0c3a-8952-41ee-852f-27955f1a5427	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	456.280000000	1.073900000	2025-10-29 02:56:24.423023	2025-10-29 02:56:24.423023
d3b7a162-5ccf-47ae-a8c2-0a046eeec225	6b9280e2-476c-430b-9470-05ee75118ac6	ce750e89-ae58-40aa-8b69-ef078c54aff4	YES	48.780000000	1.004500000	2025-10-29 02:58:21.025568	2025-10-29 02:58:21.025568
ff86c550-4620-4934-aaec-179239cf8230	6b9280e2-476c-430b-9470-05ee75118ac6	de9f0b13-259c-495c-8497-072ec8d45331	NO	51.090000000	0.959200000	2025-10-29 02:59:52.735723	2025-10-29 02:59:52.735723
c435f0d9-c1b0-4675-afd2-58bf37ff171c	6b9280e2-476c-430b-9470-05ee75118ac6	5ad16a19-1481-47b8-a791-69b314373c90	YES	48.830000000	1.003500000	2025-10-29 03:00:20.946669	2025-10-29 03:00:20.946669
ffd22348-db5b-4155-bf16-194861d2ab54	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	0.090000000	1.052100000	2025-10-29 03:00:28.198235	2025-10-29 03:00:28.198235
1b3081d2-60b2-42e6-9436-545e8e35bd48	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d56f2224-6c29-4110-8330-33dec782a2e2	NO	54.190000000	0.904300000	2025-10-29 03:00:58.5619	2025-10-29 03:00:58.5619
7b403ded-9924-4944-858e-d7732296222b	986f6e58-f06f-4981-a9a6-4d721e24cd15	de9f0b13-259c-495c-8497-072ec8d45331	YES	93.780000000	1.045000000	2025-10-29 03:01:09.699077	2025-10-29 03:01:09.699077
57e3d212-f215-40b8-9741-802498e7de5a	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	97.730000000	1.002800000	2025-10-29 03:01:11.933294	2025-10-29 03:01:11.933294
504d84a9-a935-4f74-a03a-88eaf42b8d30	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	9.870000000	0.992900000	2025-10-29 03:02:51.494756	2025-10-29 03:02:51.494756
693174ea-7705-445e-afb7-11b33a14e760	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d56f2224-6c29-4110-8330-33dec782a2e2	YES	17.750000000	1.104000000	2025-10-29 03:02:47.949737	2025-10-29 03:03:01.74
9527fd95-edf6-4198-b256-653738c91366	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	9.740000000	1.006400000	2025-10-29 03:17:49.546375	2025-10-29 03:17:49.546375
6171cae8-d743-4b72-b93c-0612345a6a40	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	7.820000000	1.252900000	2025-10-29 03:02:58.088387	2025-10-29 03:02:58.088387
369dbeac-c590-4f47-be7e-0d1fc5e0b983	0630514b-c953-4b9c-bea4-1fbe518040ef	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	9.860000000	0.993800000	2025-10-29 03:07:06.360712	2025-10-29 03:07:06.360712
56a9d5fa-052d-438c-989a-824b0f8b6283	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	de9f0b13-259c-495c-8497-072ec8d45331	YES	46.560000000	1.052500000	2025-10-29 03:03:06.443384	2025-10-29 03:03:06.443384
aab453cd-4ce4-4580-9a77-31ba4e701329	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	9.160000000	1.070300000	2025-10-29 03:03:59.973197	2025-10-29 03:03:59.973197
3451ac43-10d5-400e-8e9c-69aff50bc307	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d34373d6-1998-4d30-ad8b-86693941de64	YES	9.640000000	1.016300000	2025-10-29 03:17:57.264503	2025-10-29 03:17:57.264503
8eee28f3-5f98-4c05-9d62-f1d7d81b3c42	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	36d4b50a-987e-4b93-864b-aca00db121f7	YES	48.490000000	1.010500000	2025-10-29 03:18:17.652249	2025-10-29 03:18:17.652249
77895797-90e7-4073-ab1f-31c516d428b6	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	166.450000000	0.941400000	2025-10-29 03:18:44.804067	2025-10-29 03:18:55.122
b796efa2-494f-46d9-baca-c3dae4b1ed71	477a8b79-e143-4a9d-9973-a8cddae67200	d56f2224-6c29-4110-8330-33dec782a2e2	YES	88.270000000	1.110200000	2025-10-29 03:40:10.830967	2025-10-29 03:40:10.830967
87072fd1-bcb9-466a-ac97-e0ebd19607c2	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d827611b-bd78-4f00-a05c-b68859aefca5	YES	9.780000000	1.001600000	2025-10-29 03:04:03.219266	2025-10-29 03:04:03.219266
8a5abbd6-1c03-4b82-811c-f0b6d08e3499	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	5ad16a19-1481-47b8-a791-69b314373c90	NO	9.850000000	0.994500000	2025-10-29 03:17:55.972688	2025-10-29 03:17:55.972688
948412cb-c4ef-490b-847e-fa2a6392d9f1	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	d30c9b38-20d5-4921-9666-2efdd14c2a6a	NO	476.580000000	1.028200000	2025-10-29 03:18:11.695635	2025-10-29 03:18:11.695635
26042a73-666a-46e4-bec7-f74fdc96f5a5	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	597.820000000	0.819700000	2025-10-29 03:27:58.106749	2025-10-29 03:27:58.106749
2f635f96-2ebc-44e7-9588-b2776f467f18	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	8.250000000	1.188000000	2025-10-29 03:37:52.616851	2025-10-29 03:37:52.616851
eca5637f-daf4-4626-bfda-0c942f5fe700	477a8b79-e143-4a9d-9973-a8cddae67200	d30c9b38-20d5-4921-9666-2efdd14c2a6a	YES	102.710000000	0.954200000	2025-10-29 03:41:05.525324	2025-10-29 03:41:05.525324
56494c3d-31e1-4118-98a4-021ca5558a3a	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	41.140000000	1.191200000	2025-10-29 04:21:07.408029	2025-10-29 04:21:07.408029
329a4ce9-6890-43be-9fdf-4a1320875a67	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	9.300000000	1.054200000	2025-10-29 04:28:29.304243	2025-10-29 04:28:29.304243
e88cabdc-b4a9-4235-b652-7264c75cfbdc	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	34c43b93-174a-4546-9ad6-97bde99d37dc	YES	475.060000000	1.031500000	2025-10-29 05:20:24.616651	2025-10-29 05:20:24.616651
0052ee38-1a68-46bd-92e6-274f565ccbb7	bd56d08d-5742-46cd-bc48-fb65d8d58111	d56f2224-6c29-4110-8330-33dec782a2e2	NO	10.930000000	0.897000000	2025-10-29 05:46:05.291861	2025-10-29 05:46:05.291861
9d96d881-f5dd-49ff-8405-90798524d21e	97c3ead3-ae64-4a29-89da-5d5006dcbf43	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	9.290000000	1.055200000	2025-10-29 05:51:40.778858	2025-10-29 05:51:40.778858
b1a986ca-a49e-4df2-b383-e97080c25d1d	f166a726-47ab-404b-9555-16a114a5cb89	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	9.280000000	1.056200000	2025-10-29 07:31:19.018114	2025-10-29 07:31:19.018114
a1750e96-f25d-49ed-b4eb-6d9635b7d0d7	4cfa95be-699c-4019-b7e7-873475ad0fc5	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	116.380000000	0.842100000	2025-10-29 08:23:11.686938	2025-10-29 08:23:11.686938
c754f6c1-4692-4db8-96f3-b6b060bb80c5	23144889-a854-43a5-ada7-d9cb5abc31f0	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	405.690000000	1.207800000	2025-10-29 09:03:43.99827	2025-10-29 09:03:43.99827
042f4613-763e-4d89-ba5f-b45eb614a98f	088deaa4-8a69-4d01-ac4c-a00a67444efc	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	46.260000000	1.059200000	2025-10-29 09:56:20.06679	2025-10-29 09:56:20.06679
e5137f97-acac-4dc3-ac55-813ad9aa21ed	a85fd10a-3ea5-4f11-9740-799d19224b70	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	10.400000000	0.942400000	2025-10-29 10:06:38.010582	2025-10-29 10:06:38.010582
91732547-5d43-448d-a69e-65c0a1782535	a85fd10a-3ea5-4f11-9740-799d19224b70	21649439-df19-49a7-bd15-18cb5f39aeb9	NO	60.350000000	0.811900000	2025-10-29 10:07:40.265178	2025-10-29 10:07:40.265178
fa51c86c-aebc-4102-a674-7e42c94d541c	ae6cf106-8d94-4ca6-9e85-8165196a9011	d56f2224-6c29-4110-8330-33dec782a2e2	YES	759.810000000	1.160800000	2025-10-29 10:33:06.215488	2025-10-29 10:33:36.948
150d3bae-7c06-44a9-b8d9-3c7271af4177	9e1c1b26-c03b-4319-9e39-e477f314e814	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	YES	91.960000000	1.065700000	2025-10-29 11:12:41.895922	2025-10-29 11:12:41.895922
9608834f-cf31-41a9-aacd-8f545aaecd22	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	7.970000000	1.228900000	2025-10-29 11:14:00.210629	2025-10-29 11:14:00.210629
a1087018-e5cf-4566-a331-05cbee107dad	9e1c1b26-c03b-4319-9e39-e477f314e814	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	51.750000000	0.946900000	2025-10-29 11:14:08.730481	2025-10-29 11:14:08.730481
c11fc5b3-4ee3-4c38-bf6a-6e5894a09480	9e1c1b26-c03b-4319-9e39-e477f314e814	41fc85d3-13b2-4e7b-8d04-2db65c3a5675	YES	449.480000000	1.090100000	2025-10-29 11:14:53.255458	2025-10-29 11:14:53.255458
c3f0cf77-5a49-4122-9340-7724a337b6b7	9e1c1b26-c03b-4319-9e39-e477f314e814	2f04d2b4-a630-4e96-8015-c5022e6c1b48	NO	96.970000000	1.010600000	2025-10-29 11:15:47.216149	2025-10-29 11:15:47.216149
f6d85673-f2c2-40cc-8ab2-4a1cab61ab7c	9e1c1b26-c03b-4319-9e39-e477f314e814	5ad16a19-1481-47b8-a791-69b314373c90	YES	97.040000000	1.009900000	2025-10-29 11:16:24.316791	2025-10-29 11:16:24.316791
7589f4e6-a0c4-44df-99c5-238130d746b2	6f37eec8-c479-419d-bc02-5dc6064b7e2e	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	7.970000000	1.230000000	2025-10-29 11:29:06.003602	2025-10-29 11:29:06.003602
e30508b8-760f-4771-8dd8-d23a2be86f30	477a8b79-e143-4a9d-9973-a8cddae67200	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	92.590000000	1.058500000	2025-10-29 11:37:25.282335	2025-10-29 11:37:25.282335
aab21b6a-0933-4156-8429-378ce470d0f0	477a8b79-e143-4a9d-9973-a8cddae67200	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	99.040000000	0.989500000	2025-10-29 11:38:13.859129	2025-10-29 11:38:13.859129
fd7d67db-01db-4fef-9ae7-f461d79e838d	477a8b79-e143-4a9d-9973-a8cddae67200	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	92.710000000	1.057100000	2025-10-29 11:38:58.835306	2025-10-29 11:38:58.835306
c2f4c2c0-407d-4e16-ae08-86f711911955	9095d825-361c-47f5-a10d-1aa6f559f7f5	7a6658de-1c31-445c-90e0-370fc3977773	YES	475.970000000	1.029500000	2025-10-29 11:45:04.774157	2025-10-29 11:45:04.774157
1015d3d4-e05f-4821-acee-6466aa39c7ae	32735788-8647-4ccc-9ecb-54f45a69e878	2f04d2b4-a630-4e96-8015-c5022e6c1b48	YES	9.850000000	0.994900000	2025-10-29 13:41:02.65781	2025-10-29 13:41:02.65781
a7dc9704-288b-4e59-ae77-24cb6cd77344	64b0f2e4-508c-4efa-8b39-0b3569451567	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	219.640000000	0.950400000	2025-10-29 15:08:57.543938	2025-10-29 15:08:57.543938
787ac0af-66dc-4529-9dfd-f85a7a391bcd	5f8d475c-cbf4-4590-93f9-490db5f1eb48	d56f2224-6c29-4110-8330-33dec782a2e2	YES	40.430000000	1.212000000	2025-10-29 15:43:46.835772	2025-10-29 15:43:46.835772
2bffcfe4-4953-4faa-843e-6350874c3147	9e1c1b26-c03b-4319-9e39-e477f314e814	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	93.690000000	1.046000000	2025-10-29 15:56:51.115452	2025-10-29 15:56:51.115452
8345be81-8d83-40c4-b970-df008770a26b	9e1c1b26-c03b-4319-9e39-e477f314e814	e2b697e2-deda-4171-a6d9-0d1c66ba888f	NO	53.740000000	0.911800000	2025-10-29 15:59:36.831822	2025-10-29 15:59:36.831822
43a52b72-f12f-4e38-97dd-adcb58de1f04	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	437.660000000	1.119600000	2025-10-29 16:03:51.807047	2025-10-29 16:03:51.807047
7bb08939-ccc5-4ea0-9807-ceaa9652eed9	f166a726-47ab-404b-9555-16a114a5cb89	d56f2224-6c29-4110-8330-33dec782a2e2	YES	8.060000000	1.215200000	2025-10-29 17:10:22.808056	2025-10-29 17:10:22.808056
0e646270-382e-4c65-9e6d-22f8144b105e	74923495-465e-44cc-9609-5c8a1ed982ba	21649439-df19-49a7-bd15-18cb5f39aeb9	YES	39.730000000	1.233200000	2025-10-29 17:18:26.875435	2025-10-29 17:18:26.875435
cada4783-7b4a-4528-a0ea-ce4d9f0ec575	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	41efe570-c5e6-4f03-a3a9-003e1c80db46	YES	46.020000000	1.064700000	2025-10-29 18:24:55.982937	2025-10-29 18:24:55.982937
43622d74-976b-41c8-91af-05b78924bec6	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	d56f2224-6c29-4110-8330-33dec782a2e2	NO	118.510000000	0.827000000	2025-10-29 18:36:00.012338	2025-10-29 18:36:00.012338
ff7112a4-1c8f-4b71-ab7e-b180b43e325d	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	e3183a8b-006f-43f1-bce5-beecd73e4505	NO	102.480000000	0.956200000	2025-10-29 18:38:16.639003	2025-10-29 18:38:16.639003
774d4571-2ab0-4e62-9ebb-cba60170e9c7	df9311d2-24d6-4018-9afb-e9d114f142c2	c4fadc68-4591-44c1-ae46-2b92182aaad6	NO	478.280000000	1.024500000	2025-10-29 19:00:28.028655	2025-10-29 19:00:28.028655
6bf12729-065b-4018-afb2-572cd8aa7e14	27432bf0-e96a-4136-88ed-fe24815881e6	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	8.550000000	1.146300000	2025-10-29 20:03:56.523011	2025-10-29 20:03:56.523011
b3b69a39-fd22-4d39-9c48-fdd051b629d2	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	f75b7fdf-79e6-431d-a12c-1ee2e43eab3f	NO	511.700000000	0.957600000	2025-10-29 21:02:59.766761	2025-10-29 21:02:59.766761
9c32bbf8-259e-44dd-8fbd-ee9e5d608a86	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	ae59057f-cbc0-4ee4-b623-257f78296ba4	NO	479.210000000	1.022500000	2025-10-29 21:06:16.46989	2025-10-29 21:06:16.46989
c9dd9c33-67b3-48d6-aab8-2c5e7551fda1	78692077-9972-4fc9-9757-92e393af4830	e3183a8b-006f-43f1-bce5-beecd73e4505	YES	9.410000000	1.041000000	2025-10-29 21:24:13.681935	2025-10-29 21:24:13.681935
61ee38b1-bd29-40fd-9e2c-4622a529d650	8c3fd324-9419-40fc-ab4d-22229b75b911	de9f0b13-259c-495c-8497-072ec8d45331	NO	102.870000000	0.952600000	2025-10-29 21:28:43.27474	2025-10-29 21:28:43.27474
8212fcb6-2c8c-4e5f-97d9-ba8f67ead012	e373c930-5e25-404b-a36b-0faf910436a3	e2b697e2-deda-4171-a6d9-0d1c66ba888f	YES	659.460000000	1.188800000	2025-10-29 21:49:10.215989	2025-10-29 21:49:10.215989
\.


--
-- Data for Name: scraped_kols; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.scraped_kols (id, rank, username, x_handle, wins, losses, sol_gain, usd_gain, pnl_1d, pnl_7d, pnl_30d, win_rate_1d, win_rate_7d, win_rate_30d, total_trades_1d, total_trades_7d, total_trades_30d, profile_url, scraped_at) FROM stdin;
ed3e694e-bbfe-40cb-b702-823e497795ec	1	m a m b a 🧲	4nvNc7	715	37	39.26	7915.90	39.26	61.92	-79.79	28.85	28.62	26.58	52	297	884	/account/4nvNc7dDEqKKLM4Sr9Kgk3t1of6f8G66kT64VoC95LYh?timeframe=1	2025-10-27 00:25:43.987306
e901eff3-9fab-4fc8-92fa-efbec2acf617	2	2	\N	20	9	35.41	7139.80	35.41	187.24	986.48	68.97	68.48	62.63	29	184	835	/account/4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk?timeframe=1	2025-10-27 00:25:43.987306
7b472581-a0a4-47a6-a158-f762cdd49cab	3	3	CyaE1V	33	30	35.31	7118.50	35.31	416.24	2023.15	52.38	53.71	52.02	63	674	3176	/account/CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o?timeframe=1	2025-10-27 00:25:43.987306
4e840aba-d7c9-42c3-8802-3e8f68951895	1	m a m b a 🧲	4nvNc7	715	36	42.94	8668.00	42.94	65.19	-76.53	29.41	28.62	26.58	51	297	884	/account/4nvNc7dDEqKKLM4Sr9Kgk3t1of6f8G66kT64VoC95LYh?timeframe=1	2025-10-27 00:29:20.727514
0f327c8b-7521-4dbd-a99c-df171f213e61	2	2	\N	20	9	35.42	7149.20	35.42	187.24	986.48	68.97	68.48	62.63	29	184	835	/account/4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk?timeframe=1	2025-10-27 00:29:20.727514
8342ca54-35c1-4bab-897a-a0cfb73dde02	3	3	CyaE1V	33	30	35.31	7127.30	35.31	416.23	2023.13	52.38	53.71	52.02	63	674	3176	/account/CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o?timeframe=1	2025-10-27 00:29:20.727514
4f559848-ad2a-4a9e-ad7b-7b257b93110c	4	4	Di75xb	7	6	26.25	5298.10	26.25	18.23	118.02	53.85	37.50	40.64	13	120	470	/account/Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow?timeframe=1	2025-10-27 00:29:20.727514
aa805548-0a8d-40ec-ae50-9b47d4cb2ba7	5	5	\N	53	1	25.41	5129.00	25.41	50.98	-31.10	75.00	64.71	45.24	4	17	42	/account/Cxe1d5zFifK4a4UZoHQaCK7sfqd84XjcKy1qtjnz3bge?timeframe=1	2025-10-27 00:29:20.727514
d7467bfe-6625-4525-b59a-66df39286b07	6	6	B32Qbb	16	24	24.02	4849.00	24.02	32.32	327.75	40.00	33.33	38.72	40	246	966	/account/B32QbbdDAyhvUQzjcaM5j6ZVKwjCxAwGH5Xgvb9SJqnC?timeframe=1	2025-10-27 00:29:20.727514
d726f309-ab8b-4413-b48b-553a7fc962e2	7	7	JDd3hy	38	56	20.17	4070.70	20.17	13.51	229.70	40.43	34.36	40.72	94	195	1255	/account/JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN?timeframe=1	2025-10-27 00:29:20.727514
0e889f3a-a062-42b1-8b35-03de6188dc0a	8	8	2Fbbtm	35	13	19.93	4022.90	19.93	40.92	404.13	72.92	60.65	57.05	48	155	1185	/account/2FbbtmK9MN3Zxkz3AnqoAGnRQNy2SVRaAazq2sFSbftM?timeframe=1	2025-10-27 00:29:20.727514
a73b63d9-1532-4e76-bf73-6b4c690c869f	9	9	\N	2	0	18.55	3745.00	18.55	99.99	661.58	100.00	55.00	45.16	2	20	124	/account/zhYnXqK3MNSmwS3yxSvPmY5kUa1n2WUaCJgYUDrAHkL?timeframe=1	2025-10-27 00:29:20.727514
35582d83-b067-4698-9bb1-704025e3e1fe	10	10	DtjYbZ	2	6	18.37	3708.20	18.37	15.12	-121.32	25.00	26.51	27.60	8	166	663	/account/DtjYbZntc2mEm1UrZHNcKguak6h6QM4S5xobnwFgg92Y?timeframe=1	2025-10-27 00:29:20.727514
fb29adab-4dfc-4f08-b346-c948ca367016	11	11	\N	26	29	15.11	3050.90	15.11	-71.34	-121.49	47.27	33.21	32.45	55	262	832	/account/4sAUSQFdvWRBxR8UoLBYbw8CcXuwXWxnN8pXa4mtm5nU?timeframe=1	2025-10-27 00:29:20.727514
87bd48e2-144d-4559-bdef-098c9cb62a9f	12	12	BCagck	31	52	14.84	2995.90	14.84	24.69	161.55	37.35	38.61	41.72	83	316	1915	/account/BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd?timeframe=1	2025-10-27 00:29:20.727514
b8fa90a1-d238-48df-b938-6a4684ccde9e	13	13	86AEJE	24	26	14.17	2859.90	14.17	56.63	82.90	48.00	42.65	36.36	50	279	1199	/account/86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD?timeframe=1	2025-10-27 00:29:20.727514
4a59bb34-1125-406f-9487-a7ebf40fc37d	14	14	\N	5	4	14.07	2840.40	14.07	24.74	93.11	55.56	46.15	42.86	9	13	21	/account/4NtyFqqRzvHWsTmJZoT26H9xtL7asWGTxpcpCxiKax9a?timeframe=1	2025-10-27 00:29:20.727514
d0d970f7-0b30-43fa-a4b6-df6951d0da40	15	15	BTf4A2	244	72	13.59	2743.10	13.59	7.50	282.32	37.93	38.68	36.82	116	574	3096	/account/BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd?timeframe=1	2025-10-27 00:29:20.727514
b79eba41-a2d0-4e97-bf95-d4ac4d22bdc0	16	16	\N	1	0	11.14	2248.80	11.14	-28.80	-12.44	100.00	40.48	48.21	1	42	112	/account/qP3Q8d4WWsGbqkTfyA9Dr6cAD7DQoBuxPJMFTK48rWU?timeframe=1	2025-10-27 00:29:20.727514
fbf8211d-2d9d-4e94-8aa1-d0bb45395e76	17	17	78N177	17725	16	11.05	2230.40	11.05	207.35	872.57	60.98	54.50	71.76	41	422	1080	/account/78N177fzNJpp8pG49xDv1efYcTMSzo9tPTKEA9mAVkh2?timeframe=1	2025-10-27 00:29:20.727514
d7f58cc3-ac58-4327-8b7f-2e332f0497f4	18	18	AeLb2R	14	17	11.01	2222.80	11.01	15.68	48.10	45.16	37.23	44.44	31	137	774	/account/AeLb2RpVwrqKZJ87PEiFdReiEXJXACQn17c8APQS1FHx?timeframe=1	2025-10-27 00:29:20.727514
2bf21343-16c9-4df8-bd17-b663873201c1	19	19	5vg7he	5	9	9.87	1991.70	9.87	87.04	73.93	35.71	38.27	41.36	14	81	324	/account/5vg7he5HibvsAW86wfiuP6jw7VwKmUAnP6P93mVCdpJu?timeframe=1	2025-10-27 00:29:20.727514
5b946cc7-28e5-4e03-97f1-575283d2dcce	20	20	UxuuMe	15	20	9.61	1939.60	9.61	44.73	207.31	42.86	37.83	35.59	35	267	753	/account/UxuuMeyX2pZPHmGZ2w3Q8MysvExCAquMtvEfqp2etvm?timeframe=1	2025-10-27 00:29:20.727514
824a77f0-93c8-43d5-8215-577c4815e47c	1	m a m b a 🧲	\N	715	35	43.84	8841.80	43.84	65.41	-76.31	30.00	28.62	26.58	50	297	884	/account/4nvNc7dDEqKKLM4Sr9Kgk3t1of6f8G66kT64VoC95LYh?timeframe=1	2025-10-27 00:35:51.47331
5489863c-9009-42ab-85c7-25ea50353f1c	2	jijo	\N	20	9	35.33	7124.80	35.33	187.15	987.33	68.97	68.48	62.71	29	184	834	/account/4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk?timeframe=1	2025-10-27 00:35:51.47331
ab96e042-d6a8-4f2c-8827-fb2d7997ebd3	3	cented	\N	33	30	35.31	7121.00	35.31	416.38	2023.14	52.38	53.79	52.02	63	673	3176	/account/CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o?timeframe=1	2025-10-27 00:35:51.47331
7de26689-37b2-45b9-8680-cf34d442b64c	4	n’o	\N	7	6	26.25	5293.30	26.25	18.23	118.02	53.85	37.50	40.64	13	120	470	/account/Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow?timeframe=1	2025-10-27 00:35:51.47331
d4ba29b5-5e5b-4636-99d7-ba308172628f	5	dj.σn	\N	53	1	25.41	5124.20	25.41	50.59	-31.38	75.00	64.71	45.24	4	17	42	/account/Cxe1d5zFifK4a4UZoHQaCK7sfqd84XjcKy1qtjnz3bge?timeframe=1	2025-10-27 00:35:51.47331
ac635c95-3245-42ce-b3fb-77066f18a677	6	kadenox	\N	16	24	24.02	4844.70	24.02	28.02	327.67	40.00	33.06	38.65	40	245	965	/account/B32QbbdDAyhvUQzjcaM5j6ZVKwjCxAwGH5Xgvb9SJqnC?timeframe=1	2025-10-27 00:35:51.47331
72096548-6cc6-4abf-94b2-1d909fdf8f33	7	west	\N	38	56	20.17	4067.10	20.17	13.51	229.71	40.43	34.36	40.72	94	195	1255	/account/JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN?timeframe=1	2025-10-27 00:35:51.47331
92693658-bcae-4fd3-98cf-9c1c1dfa8fcc	8	iconxbt	\N	35	13	19.93	4019.30	19.93	40.92	404.14	72.92	60.65	57.05	48	155	1185	/account/2FbbtmK9MN3Zxkz3AnqoAGnRQNy2SVRaAazq2sFSbftM?timeframe=1	2025-10-27 00:35:51.47331
e6b3c5ec-8b0a-4cfc-8cd3-5d75648a99ca	9	files	\N	3	7	19.90	4014.20	19.90	16.65	-119.79	30.00	26.79	27.67	10	168	665	/account/DtjYbZntc2mEm1UrZHNcKguak6h6QM4S5xobnwFgg92Y?timeframe=1	2025-10-27 00:35:51.47331
d685bf89-d579-492f-be93-3bc71cc42bed	10	zhynx	\N	2	0	18.55	3741.70	18.55	99.99	657.07	100.00	55.00	45.16	2	20	124	/account/zhYnXqK3MNSmwS3yxSvPmY5kUa1n2WUaCJgYUDrAHkL?timeframe=1	2025-10-27 00:35:51.47331
c527690e-d09e-492c-8bcb-50bc340b9577	11	scharo	\N	26	29	15.11	3048.20	15.11	-71.34	-121.48	47.27	33.21	32.45	55	262	832	/account/4sAUSQFdvWRBxR8UoLBYbw8CcXuwXWxnN8pXa4mtm5nU?timeframe=1	2025-10-27 00:35:51.47331
dce90231-ef63-44d3-94db-3c3022d73c48	12	dv	\N	31	52	14.84	2993.30	14.84	24.69	161.37	37.35	38.61	41.69	83	316	1914	/account/BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd?timeframe=1	2025-10-27 00:35:51.47331
d2be14f7-7acd-4a3e-b1af-8b721b42a757	13	publix	\N	24	26	14.17	2857.40	14.17	56.63	82.90	48.00	42.65	36.36	50	279	1199	/account/86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD?timeframe=1	2025-10-27 00:35:51.47331
cb7f5a4d-82bc-4312-a5ac-d291920b6c96	14	inside calls	\N	5	4	14.13	2849.90	14.13	24.80	93.35	55.56	46.15	42.86	9	13	21	/account/4NtyFqqRzvHWsTmJZoT26H9xtL7asWGTxpcpCxiKax9a?timeframe=1	2025-10-27 00:35:51.47331
7675fd59-3411-45a2-9c66-19625c799e88	15	kev	\N	244	72	13.59	2740.70	13.59	7.51	282.38	37.93	38.68	36.83	116	574	3095	/account/BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd?timeframe=1	2025-10-27 00:35:51.47331
f814af1e-39a4-480e-b775-d2be54092b9c	16	kitty	\N	1	0	12.00	2419.40	12.00	-27.95	-11.58	100.00	40.48	48.21	1	42	112	/account/qP3Q8d4WWsGbqkTfyA9Dr6cAD7DQoBuxPJMFTK48rWU?timeframe=1	2025-10-27 00:35:51.47331
30a965ca-b730-4a48-b173-2141d19c1b3a	17	oscar	\N	14	17	11.01	2220.80	11.01	15.68	48.10	45.16	37.23	44.44	31	137	774	/account/AeLb2RpVwrqKZJ87PEiFdReiEXJXACQn17c8APQS1FHx?timeframe=1	2025-10-27 00:35:51.47331
e37ed603-9c6e-4cc8-af77-f02425da31bd	18	sheep	\N	17724	16	11.01	2219.90	11.01	207.36	872.57	60.00	54.50	71.76	40	422	1080	/account/78N177fzNJpp8pG49xDv1efYcTMSzo9tPTKEA9mAVkh2?timeframe=1	2025-10-27 00:35:51.47331
2f627edc-f55b-4d50-8d77-060cab8f9b21	19	blixze ♱	\N	5	8	10.30	2077.00	10.30	87.04	73.93	38.46	38.27	41.36	13	81	324	/account/5vg7he5HibvsAW86wfiuP6jw7VwKmUAnP6P93mVCdpJu?timeframe=1	2025-10-27 00:35:51.47331
861c116d-9f6e-486d-9509-c577949c0160	20	pandora	\N	15	20	9.61	1937.90	9.61	44.73	207.31	42.86	37.83	35.59	35	267	753	/account/UxuuMeyX2pZPHmGZ2w3Q8MysvExCAquMtvEfqp2etvm?timeframe=1	2025-10-27 00:35:51.47331
18437ab9-2e7a-465c-b195-ee7849c8fbcc	1	m a m b a 🧲	\N	717	35	48.01	9785.50	48.01	69.22	-72.33	32.69	29.24	26.84	52	301	883	/account/4nvNc7dDEqKKLM4Sr9Kgk3t1of6f8G66kT64VoC95LYh?timeframe=1	2025-10-27 01:18:05.37442
337beb64-2a10-4547-8a70-3d9121d82f05	2	jijo	\N	22	9	38.39	7825.90	38.39	190.74	994.78	70.97	68.98	62.95	31	187	834	/account/4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk?timeframe=1	2025-10-27 01:18:05.37442
b31e1572-015f-407e-b064-be46f38df986	3	cented	\N	35	31	36.06	7349.80	36.06	415.14	2019.86	53.03	53.97	52.02	66	667	3174	/account/CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o?timeframe=1	2025-10-27 01:18:05.37442
59871bf2-5cf0-4de9-9795-a6d95b694876	4	n’o	\N	7	6	26.25	5349.80	26.25	19.22	117.98	53.85	37.82	40.64	13	119	470	/account/Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow?timeframe=1	2025-10-27 01:18:05.37442
ad0b1a05-673f-4a19-8ded-2f49bab9886b	5	west	\N	38	56	25.03	5101.60	25.03	18.94	235.75	40.43	34.85	40.77	94	198	1251	/account/JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN?timeframe=1	2025-10-27 01:18:05.37442
bb88d0b2-3ed5-4475-907e-1d8cc8a0d123	6	dj.σn	\N	53	1	24.51	4996.10	24.51	61.00	-19.49	75.00	64.71	45.24	4	17	42	/account/Cxe1d5zFifK4a4UZoHQaCK7sfqd84XjcKy1qtjnz3bge?timeframe=1	2025-10-27 01:18:05.37442
881879ed-3876-476b-bb77-c86b219caf48	7	kadenox	\N	16	24	24.02	4896.30	24.02	27.57	327.88	40.00	32.79	38.67	40	244	962	/account/B32QbbdDAyhvUQzjcaM5j6ZVKwjCxAwGH5Xgvb9SJqnC?timeframe=1	2025-10-27 01:18:05.37442
e297312a-95d6-47a3-baaf-4c8b6dacfc08	8	iconxbt	\N	35	13	19.93	4062.20	19.93	40.92	405.22	72.92	60.65	57.24	48	155	1181	/account/2FbbtmK9MN3Zxkz3AnqoAGnRQNy2SVRaAazq2sFSbftM?timeframe=1	2025-10-27 01:18:05.37442
eef08ee5-6911-4d79-a80e-67ff72633ea9	9	files	\N	3	11	19.91	4057.80	19.91	16.66	-120.35	21.43	26.16	27.30	14	172	663	/account/DtjYbZntc2mEm1UrZHNcKguak6h6QM4S5xobnwFgg92Y?timeframe=1	2025-10-27 01:18:05.37442
790f36c7-b20e-428f-9c20-e91a97398059	10	zhynx	\N	2	0	18.55	3781.60	18.55	99.99	614.76	100.00	55.00	45.16	2	20	124	/account/zhYnXqK3MNSmwS3yxSvPmY5kUa1n2WUaCJgYUDrAHkL?timeframe=1	2025-10-27 01:18:05.37442
efe2fd46-2e93-41e5-b4af-f12d359499a4	11	scharo	\N	31	31	15.10	3078.60	15.10	-71.38	-121.52	50.00	34.20	32.78	62	269	839	/account/4sAUSQFdvWRBxR8UoLBYbw8CcXuwXWxnN8pXa4mtm5nU?timeframe=1	2025-10-27 01:18:05.37442
5026c01b-5bc7-4ea5-809e-a1f284ec23d4	12	publix	\N	24	26	14.17	2887.90	14.17	56.63	82.89	48.00	42.65	36.36	50	279	1199	/account/86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD?timeframe=1	2025-10-27 01:18:05.37442
9e8e3384-e056-48ce-8095-caf60c5fa926	13	inside calls	\N	5	4	14.10	2874.80	14.10	24.78	96.61	55.56	46.15	42.86	9	13	21	/account/4NtyFqqRzvHWsTmJZoT26H9xtL7asWGTxpcpCxiKax9a?timeframe=1	2025-10-27 01:18:05.37442
b02fb99f-574f-46da-9b2e-052e9199af8c	14	kitty	\N	1	0	13.62	2776.20	13.62	-26.32	-9.96	100.00	40.48	48.21	1	42	112	/account/qP3Q8d4WWsGbqkTfyA9Dr6cAD7DQoBuxPJMFTK48rWU?timeframe=1	2025-10-27 01:18:05.37442
4b304409-7ab5-4ee2-b37a-8b998694f91a	15	kev	\N	247	77	13.45	2741.00	13.45	7.47	278.64	37.90	38.73	36.81	124	581	3089	/account/BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd?timeframe=1	2025-10-27 01:18:05.37442
f0dfd157-641a-4b9f-b7c1-6efc10259a76	16	dv	\N	28	49	12.97	2643.50	12.97	24.71	161.16	36.36	38.68	41.69	77	318	1902	/account/BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd?timeframe=1	2025-10-27 01:18:05.37442
1fba8912-fd33-42bc-b1da-fdb05b1349ed	17	sheep	\N	17724	15	11.20	2282.50	11.20	207.32	872.53	61.54	54.50	71.76	39	422	1080	/account/78N177fzNJpp8pG49xDv1efYcTMSzo9tPTKEA9mAVkh2?timeframe=1	2025-10-27 01:18:05.37442
a2925e77-da81-4597-953b-e9d47006989b	18	pandora	\N	17	23	10.64	2168.60	10.64	45.76	208.34	42.50	37.87	35.62	40	272	758	/account/UxuuMeyX2pZPHmGZ2w3Q8MysvExCAquMtvEfqp2etvm?timeframe=1	2025-10-27 01:18:05.37442
966148ca-6565-4669-9087-12f49e187936	19	blixze ♱	\N	4	6	10.52	2144.80	10.52	87.04	73.84	40.00	38.27	41.36	10	81	324	/account/5vg7he5HibvsAW86wfiuP6jw7VwKmUAnP6P93mVCdpJu?timeframe=1	2025-10-27 01:18:05.37442
3fcedc8b-3989-4a5d-8d01-ed98798f3207	20	oscar	\N	16	21	9.77	1991.70	9.77	14.44	46.78	43.24	37.06	44.29	37	143	779	/account/AeLb2RpVwrqKZJ87PEiFdReiEXJXACQn17c8APQS1FHx?timeframe=1	2025-10-27 01:18:05.37442
31f6b737-f4fc-4ff6-9a71-b13c9973289c	1	Ansem	@blknoiz06	\N	\N	1250.50	2847500.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
e43fc1a1-7386-489b-932d-0c958f2af153	2	Crypto Rover	@rovercrc	\N	\N	845.30	1923800.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
30d8257c-c920-4d14-9828-6d051a4b4c60	3	Altcoin Daily	@altcoindaily	\N	\N	723.80	1654200.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
ef383916-eadf-452d-8793-05d8266eeebd	4	Crypto Cobain	@cryptocobain	\N	\N	628.40	1432900.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
503fecbb-e83e-4944-8bec-6902063e5e01	5	Lark Davis	@thecryptolark	\N	\N	564.20	1287600.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
624bfe3b-6411-4958-989b-1467676cdb1b	6	Byzantine General	@generalbitcoin	\N	\N	507.10	1156300.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
86a261fc-5306-4ac6-9e0d-8f780daa3139	7	Elliotrades	@elliotrades	\N	\N	457.80	1043700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
6b693dd2-79f2-454b-8ca7-2914406a603b	8	Miles Deutscher	@milesdeutscher	\N	\N	433.20	987400.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
739373a4-785e-44d6-b957-625d5892f8f6	9	Crypto Banter	@cryptobanter	\N	\N	384.50	876200.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
7fefb6a2-88d2-4428-ada3-870ff7a5c76a	10	Crypto Kaleo	@cryptokaleo	\N	\N	327.30	745800.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-27 15:43:06.617347
\.


--
-- Data for Name: solana_deposits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.solana_deposits (id, user_id, signature, amount, deposit_address, status, confirmations, created_at, confirmed_at) FROM stdin;
\.


--
-- Data for Name: solana_withdrawals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.solana_withdrawals (id, user_id, destination_address, amount, signature, status, error, created_at, processed_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, user_id, type, amount, balance_after, description, created_at) FROM stdin;
9c5cec04-5a4a-4645-aec7-83b41317c6b2	72e306d2-207c-462c-9415-a0c7aa96a2ab	refund	500.00	500.00	Refund for cancelled market	2025-10-28 23:01:39.478337
673aa451-2bed-4469-a58e-3d16ab12e411	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	refund	100.00	1000.00	Refund for cancelled market	2025-10-28 23:01:39.478337
f5739009-c464-4b6f-be0b-e77e6a1e25dc	72e306d2-207c-462c-9415-a0c7aa96a2ab	refund	500.00	1000.00	Refund for cancelled market	2025-10-28 23:01:39.478337
7f2d7e48-a195-456a-88be-3db59caf5d17	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	refund	500.00	500.00	Refund for cancelled market	2025-10-28 23:01:39.478337
51c29c94-16dd-4b46-b1f1-b59ce50752fb	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	refund	500.00	1000.00	Refund for cancelled market	2025-10-28 23:01:39.478337
cc71b3cc-cd3b-4fdd-ba50-e41e755a0baf	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	referral_commission	0.50	1000.50	Referral commission (1.00%) from bet e40a31a3-39fc-4a8a-9e70-e7ca4e22b317	2025-10-29 04:21:07.408029
935fd34b-0110-474b-85f6-d64253a8ca61	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	referral_commission	0.10	1000.60	Referral commission (1.00%) from bet c15ac404-1331-425a-a3f1-bf15ef1911d4	2025-10-29 04:28:29.304243
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_achievements (id, user_id, achievement_id, earned_at) FROM stdin;
10705933-28f9-46a4-b5a0-ae1cabf73f10	2a5a8384-d652-42e3-bed1-b03545d35725	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-27 00:50:42.118033
0feec151-b723-43d1-b311-4d6225b5b914	2a5a8384-d652-42e3-bed1-b03545d35725	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-27 02:07:46.405878
1c8a6125-545e-46f3-9324-d934bcfe3a3b	2a5a8384-d652-42e3-bed1-b03545d35725	27609639-747f-44b0-a043-6397c0e5779f	2025-10-27 02:07:46.518745
289a343f-3370-4326-9a59-81f5f5a3ae9c	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-27 15:49:34.007305
bfdbe4ef-8994-4086-a101-da2c408af4df	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	27609639-747f-44b0-a043-6397c0e5779f	2025-10-27 15:56:24.241319
b2a7b250-9c17-49fe-823a-44c29a07f78a	72e306d2-207c-462c-9415-a0c7aa96a2ab	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-27 16:26:30.68187
5dbb7409-97eb-4564-84e8-4dc1e6f98c9f	38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-27 16:26:46.363521
1eb7f0b3-e72b-43a8-b696-81db8421dbab	72e306d2-207c-462c-9415-a0c7aa96a2ab	27609639-747f-44b0-a043-6397c0e5779f	2025-10-27 16:27:04.536814
43bfc673-3d3d-437d-aeaa-20d4b081b046	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-27 16:27:29.853786
17f13040-fc03-405e-8838-8911f9fe2459	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	27609639-747f-44b0-a043-6397c0e5779f	2025-10-27 16:27:37.656435
50519779-1644-4eb9-a56c-5add77f1f18d	9834faee-2e62-43c4-8bdf-e8a48c024bd0	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:13:26.39277
dcd47f75-d4b5-4eff-8b08-bfdef2ab17be	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:14:17.229563
e282dd20-51a9-4f4b-bc12-c10468bc18be	d8c125df-fb1f-4755-9975-1e23ffdd006a	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:15:27.730452
200f400f-77ad-499a-b470-0ae07ec71891	8903720d-1010-4477-a548-0fa98558c462	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:31:21.634499
c274df71-ba80-4fd8-824b-d898c8320549	2cebf2a9-8cd9-41e2-8a76-357570839646	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:32:42.202621
b45fe7e3-d109-4965-8fee-d8eace5762f0	c694679a-47f2-416e-8e5f-34735fba5715	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:43:09.075191
21496b15-3512-47bd-9b8f-7d241db61db4	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:45:04.897364
90a4e403-bdfe-4c3b-9279-41a937313f3c	47887516-721e-4369-9fb0-918c63bb8227	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:52:13.976806
d9086eac-2b92-467f-8e9b-e0f83842a622	4a6a595c-f247-4f53-a589-e606cc428bc1	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:56:47.449708
3e2afb2d-7112-4edd-b251-424037adedf8	769a0aa2-9ce2-4a09-8efb-697727a78239	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 00:59:34.519722
3da250c0-9981-4f53-b346-d213ff346d23	088deaa4-8a69-4d01-ac4c-a00a67444efc	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:05:47.354259
5a85f4c1-acc1-4814-ba75-245eab9814ba	30505fa7-dbbb-45c9-b704-5498b6ce730d	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:12:22.206558
10f59e3b-4328-4568-9ee6-b1a8990a22f8	01289b67-bc83-469e-99a1-356102efe0fd	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:17:16.374139
d85ea920-9420-4024-9e0c-fe71084b8864	ce45f9ea-0146-431f-9469-15e31de21981	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:37:15.956591
ae1c9bf3-6d7e-40dd-a434-d76a4e4c9d4d	aec40e30-e922-4f47-8552-c07c08a12e9a	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:37:23.308638
e2098ef9-3de2-4ca8-8646-ff774c8cedda	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:38:38.79463
2ac1e8e1-379f-476a-bce5-2fde4b0cfdbd	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 01:38:53.641427
3f405b26-3cf6-4b74-89e8-52ea43763d6b	b03668e6-821a-4e06-b541-1cd2e0ea45af	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:41:46.360532
45b9eec5-0578-4260-969b-743e7245c3e5	7f0a9138-5a4d-4955-8895-dc27436f10b2	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:44:09.207031
6f0a882e-70b2-4fab-bd6f-782f939fee30	00772767-41bc-4967-8266-5541d53b105e	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:47:44.874969
2eac5542-4c74-4a7e-b54c-53c73f50bc56	00772767-41bc-4967-8266-5541d53b105e	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 01:47:44.899669
a1075e14-74cb-4e57-824a-22db32857666	0238327d-15b3-41ae-b52c-cf223ee9832c	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:48:29.87473
0c4ebbbb-42a5-4a00-b8fc-747309540a5f	bdefc13e-f3e5-49a2-b749-4aa864027d42	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:48:49.171846
a15adb65-38c3-497f-8b64-afd6462b244f	0238327d-15b3-41ae-b52c-cf223ee9832c	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 01:49:21.057863
00692140-1600-4ec2-a468-9a2c2e695ee1	0238327d-15b3-41ae-b52c-cf223ee9832c	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-29 01:51:21.359074
b00c0f0e-e458-4b10-96ba-e83aede233f5	5cdda325-1f54-42bc-b1d1-7479913fc3f5	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:51:48.247576
9294bc38-05bd-430c-b202-ffa8cf0b509e	c37781bb-d03a-4b8f-aa8b-972ee268014a	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:56:01.489049
83f80f14-d832-45ac-bf73-cdda89bbd39d	898e8852-e40d-4b2a-a8f7-3e215268febc	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 01:57:52.734311
33a4b137-f355-4db1-9238-3cf7c104ed78	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:04:20.85025
f26d9bef-55ec-48f9-93a7-7eed5b99405a	411dc4b0-c7f6-44ba-a7cd-dab215760984	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:12:46.499935
f8ad8fdd-a917-4283-890a-fb3bfc2e8b1b	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:15:40.476016
df6d66c0-96d6-4ca3-a0d7-eabcafa5e740	d6f78f80-b222-49b8-9412-eea692bcaa34	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:17:37.665186
8a34c753-f295-4b0c-9b6c-e8c0ec428863	d6f78f80-b222-49b8-9412-eea692bcaa34	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 02:18:38.429872
6189f3a6-9043-4338-8b28-4b270b9f5a47	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:28:20.701473
ac4cd060-6984-4712-91d2-69cdae8db8d5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:30:39.887574
dc9c1a0f-3438-41fd-b809-c533095cd09a	d3e4a456-7bbd-461c-8806-50dee853d118	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:31:20.802874
a650e7d0-61bf-486e-b0da-f1eac0c5e3f2	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:31:48.059493
bdcb0e6b-bf7a-46de-af55-2460663c1f27	37ed79db-51d0-4907-aa94-75502fa74c5e	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:32:52.78713
17e5cb40-414f-4804-87b4-d55336760882	e5275105-2102-4d2c-afda-0440b7afaab3	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:38:33.524349
ddf41213-7379-457e-ae6d-de3169309303	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-29 02:38:37.806406
72ba5d5e-20b2-4c58-9806-222ac78450d5	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	2cdf8eb5-05c8-4d14-935d-a30ed92a38ae	2025-10-29 02:42:46.724059
75424a90-1af7-4e02-b53b-174ca65ae72c	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	2cdf8eb5-05c8-4d14-935d-a30ed92a38ae	2025-10-29 02:42:47.104534
f7859900-9e6b-48d1-8a72-762d618ce911	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	2cdf8eb5-05c8-4d14-935d-a30ed92a38ae	2025-10-29 02:42:49.86967
1a36c26b-bd79-40bf-b2b4-73002c2d2432	116eace9-841b-48fa-a7ec-d3249bb3aa80	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:43:28.681537
dc570873-693b-4370-abe7-f1f08b3566be	e5275105-2102-4d2c-afda-0440b7afaab3	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-29 02:45:08.062946
0b0e8790-6808-49ba-a1df-2765285c77ee	e5275105-2102-4d2c-afda-0440b7afaab3	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 02:45:22.699381
60226410-aa38-4a20-8ed3-838981da880c	7c7bb616-dc44-412d-b05f-2c34fc58929b	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:46:24.709822
31af29a7-35d5-4c82-98ac-f9389b100f9c	781a2101-8dfc-480e-a185-69fab61df3cc	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:48:37.092262
c90180ce-9394-4d6d-a5ef-8dfda7e3d2bf	7c7bb616-dc44-412d-b05f-2c34fc58929b	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 02:48:52.467945
65fa4506-d1d4-484e-b50f-1be679c0bb85	781a2101-8dfc-480e-a185-69fab61df3cc	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-29 02:49:12.150986
a771dae6-2205-4f83-8eab-2fad946abbcd	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:50:54.078231
042573dd-9a8d-4750-98d7-4f611f9fc0fb	116eace9-841b-48fa-a7ec-d3249bb3aa80	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 02:52:44.997819
d548df6e-3061-41e8-bb9d-779d7ae7ef44	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 02:52:49.325979
2bc1fcab-8487-4282-8015-9db989a51e9d	781a2101-8dfc-480e-a185-69fab61df3cc	2cdf8eb5-05c8-4d14-935d-a30ed92a38ae	2025-10-29 02:54:47.314078
675a40dd-c095-4f81-8cde-72201b421b6e	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:56:38.430101
1531a744-6a7c-4363-b82f-feb5c41c7aec	6b9280e2-476c-430b-9470-05ee75118ac6	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 02:58:21.118496
f023b5b6-e56b-4490-8816-ea68f3960e0a	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:00:28.388826
aa903081-ec3b-4dad-aef9-53a654b82542	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	6a6f2d9b-14cf-497b-9e46-00b4862ec830	2025-10-29 03:04:03.638542
d335480e-65d8-43e3-8fcf-95e61e1f97fb	0630514b-c953-4b9c-bea4-1fbe518040ef	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:07:06.438166
505f82d5-6f76-421a-ba0f-32df60e2198e	477a8b79-e143-4a9d-9973-a8cddae67200	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:40:10.909569
5ede23cb-9a86-41c9-9aad-f0429eb53642	986f6e58-f06f-4981-a9a6-4d721e24cd15	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:01:09.785822
c062801a-30fc-42c6-9dab-424386e8abff	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 03:18:55.181556
fbab8a87-9958-411d-a5f4-f673ce386383	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:27:58.178749
6900f5b1-206e-41ad-8cb6-c3292afa7054	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 03:37:52.703706
684451a5-aa13-4c32-8e55-9cb4f3dfa172	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 04:21:08.072099
2888e141-ef4a-470a-93f7-c49cdd5ec7ad	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 05:20:24.711568
0be5e5a2-06af-4045-ba7b-91aaca05ccc9	bd56d08d-5742-46cd-bc48-fb65d8d58111	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 05:46:05.406225
473e5dbd-edaa-41f9-acc2-abc05c83ecbb	97c3ead3-ae64-4a29-89da-5d5006dcbf43	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 05:51:40.866481
9a5fa277-107b-4a35-9776-5284bdc89160	f166a726-47ab-404b-9555-16a114a5cb89	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 07:31:19.143475
54a7e4db-3fc7-4a6c-ad7b-c60f67a5ac99	4cfa95be-699c-4019-b7e7-873475ad0fc5	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 08:23:11.781285
6ebd82b3-f150-4d43-9bc0-0f5f1068be63	23144889-a854-43a5-ada7-d9cb5abc31f0	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 09:03:44.101449
8dd9bb98-c409-43cb-ac9e-e09ec6bee261	a85fd10a-3ea5-4f11-9740-799d19224b70	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 10:06:38.124535
899bc973-4441-4343-b2d9-d5fb87588d49	ae6cf106-8d94-4ca6-9e85-8165196a9011	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 10:33:06.311207
e500df0c-65af-4904-b468-92473f938fca	9e1c1b26-c03b-4319-9e39-e477f314e814	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 11:12:42.034035
07d97550-b97d-4cb3-bc48-8a2caa048439	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 11:14:00.300257
963c6933-2550-4086-9100-de4e32f01adc	6f37eec8-c479-419d-bc02-5dc6064b7e2e	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 11:29:06.103685
bd36543f-f22f-4544-8a4b-0d6c31ad7a3c	9095d825-361c-47f5-a10d-1aa6f559f7f5	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 11:45:04.880148
3a9d9d8a-db26-4391-9e4e-8eca78afc775	32735788-8647-4ccc-9ecb-54f45a69e878	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 13:41:02.808531
6ad271ed-1f8d-4814-920f-6d0da7157acf	64b0f2e4-508c-4efa-8b39-0b3569451567	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 15:08:57.679173
83d12c79-a86d-4476-ac7d-71cb7cff0d0a	5f8d475c-cbf4-4590-93f9-490db5f1eb48	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 15:43:46.952198
28dba132-cf78-4bc8-b075-f0fdc70b976d	9e1c1b26-c03b-4319-9e39-e477f314e814	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 15:59:36.94976
44066db2-2ef9-43a3-8157-4c1ffd9f76e2	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 16:03:51.883215
4aa76c62-9e20-48c3-ac1c-6f329208a682	74923495-465e-44cc-9609-5c8a1ed982ba	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 17:18:26.97981
5b1d8b01-abc8-4d80-aaa1-d7de378b4415	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 18:24:56.120986
2cc74625-66b5-4951-9510-bd768d0d0698	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 18:36:00.150601
00369cb5-c59d-4e69-bdd1-d6f628edeff6	df9311d2-24d6-4018-9afb-e9d114f142c2	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 19:00:28.111206
c337fea9-86b0-4b8c-ad20-968bdaefee2d	27432bf0-e96a-4136-88ed-fe24815881e6	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 20:03:56.68348
767f9944-b763-4df4-9a5f-4a3e50d3a4fe	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 21:02:59.905479
2f98bfb4-1b1d-4620-b7ea-64fa1753c7c1	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	27609639-747f-44b0-a043-6397c0e5779f	2025-10-29 21:06:16.604192
4dcf0643-f440-4943-88ba-b85849430f41	78692077-9972-4fc9-9757-92e393af4830	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 21:24:13.988379
535a55d3-3f4a-4ddb-a134-89361bd80727	8c3fd324-9419-40fc-ab4d-22229b75b911	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 21:28:43.400576
fddf2aa1-4aef-4127-a0e8-db6f397f26be	e373c930-5e25-404b-a36b-0faf910436a3	3eeaa658-3719-4a3a-baa2-5fe636e28a9c	2025-10-29 21:49:10.368439
\.


--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_follows (id, follower_id, following_id, created_at) FROM stdin;
064d8d97-c612-42d9-994f-1ec00780cdd3	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	2a5a8384-d652-42e3-bed1-b03545d35725	2025-10-27 15:48:03.367262
34357573-331b-4884-9778-9146ea9f03f4	746f0658-f3e6-44f4-bdb8-71345374be68	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	2025-10-29 03:32:31.097337
790182d7-4958-4d8c-997b-8c4f4e860de9	746f0658-f3e6-44f4-bdb8-71345374be68	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:32:42.983708
0417ebe6-316a-485d-b93d-c58e0c29ba9c	99a56924-6436-455f-812d-56cddc5dd11d	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:33:06.769405
36acc99c-e41d-404a-93de-ef1f56002eac	937db43f-f8a7-4267-8642-6f3b7bf7daca	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:33:31.880464
29544a05-9a7a-4f47-b6be-c6b37cf1cd26	26a3a171-3b7e-4f87-b72e-9c8051be3497	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:33:53.239889
23bbe88c-1fcc-4fad-bcc0-38c2056746f0	6f27289a-df8a-460f-bacf-0e17c58639dc	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:34:11.823131
ff2dccb1-e0ce-4e07-a519-966f034e3d50	fab8990b-6a36-4d52-b34b-312848c2e947	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:35:02.188136
711484c9-dcb2-47cb-9c24-cf9260deb02f	a3e9ed93-9377-4941-81a9-d46e27dd6a00	781a2101-8dfc-480e-a185-69fab61df3cc	2025-10-29 03:35:21.657596
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_profiles (id, user_id, bio, avatar_url, total_bets, total_wins, total_losses, total_volume, profit_loss, win_rate, roi, followers_count, following_count, created_at, updated_at) FROM stdin;
3e1470f1-03ca-43ab-9ec4-3b6e2cacfbe9	72e306d2-207c-462c-9415-a0c7aa96a2ab	\N	\N	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-27 00:07:07.203526	2025-10-27 00:07:07.184
57f75464-8b3c-4f4c-87cc-326bba906751	31c9faf6-0d4f-42d3-8a57-6561b7fed8aa	\N	\N	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-27 15:23:15.831831	2025-10-27 15:23:15.858
c52cae81-46ca-4b0a-a707-715958610bc4	6b97a323-188f-480a-99bb-1b5387db4b40	\N	\N	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-27 15:36:21.479953	2025-10-27 15:36:21.461
a22b3282-20ac-4ea4-bc51-766062537d65	6a7477e7-12b7-4041-8d77-c9e71214b6ef	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761694392029	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 23:33:12.080888	2025-10-28 23:33:12.083
4f400834-f671-4231-bdd2-66e86432cc6c	a609b100-e7e3-4c8f-9f00-11dbde40d6f0	\N	\N	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-27 15:47:05.66653	2025-10-27 15:48:03.464
367f8267-f4c1-4e97-9390-baea83bf7cc8	b419cad1-e11e-4dfc-b4b1-d900bf3aff21	\N	https://api.dicebear.com/9.x/notionists/svg?seed=yes	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-27 16:27:18.953643	2025-10-27 16:27:18.972
e8d8fbcc-b5f7-46dc-a53a-ab55213e4ac0	e08ad3b0-f617-4cfc-84a6-1c18e84842ac	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Kyle	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 03:05:31.217022	2025-10-28 03:05:31.22
6070f07c-6441-4a86-931d-6064e422a53b	87893e5f-85c3-4314-ad30-dbe3171e4f2f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=bp!	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 03:19:57.578742	2025-10-28 03:19:57.58
780f0722-c297-4e2e-99e1-9fa3226238e8	44c3b2b7-2212-4410-a7d2-04565bdfda9f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_sqjEHFDC	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 04:46:31.047076	2025-10-28 04:46:31.052
9d490daf-a0dc-4696-8ca4-a05b63b4b337	e64c73b7-f0b3-4bb3-9184-4825e6fa0d16	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761632469846	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 06:21:10.289616	2025-10-28 06:21:10.297
0e5d72a5-fe73-4fd5-87aa-1addf9057542	72f9d3d2-355d-4f07-908e-5f6187afb864	\N	https://api.dicebear.com/9.x/notionists/svg?seed=xj2k	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 15:05:05.611067	2025-10-28 15:05:05.616
373c823e-8db8-4032-be5d-7345c597eb50	2a5a8384-d652-42e3-bed1-b03545d35725	Just a trading dad	\N	0	0	0	0.00	0.00	0.00	0.00	1	0	2025-10-27 00:37:57.950159	2025-10-28 17:36:48.946
6dd3cf63-c9ae-4d2a-992f-3ba49370d96f	85dab627-70a4-4007-917f-87cb7865ea13	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761687483783	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 21:38:03.905025	2025-10-28 21:38:03.912
9ecb2509-c409-4317-87d1-6661630d0873	c2951623-ac43-459e-b382-c0865d8660ed	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761689752562	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 22:15:52.693605	2025-10-28 22:15:52.702
9d56192b-0ba8-44d7-85d1-d53b26d0ff58	60c6ea55-4171-4f7e-803e-443f38c8e9f1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761689754618	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 22:15:54.639451	2025-10-28 22:15:54.644
c42f99d4-86b6-4706-b3c7-95cf0c6fb612	b11b737d-41a6-4058-98b8-992bb5ebc085	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761689814109	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 22:16:54.130077	2025-10-28 22:16:54.135
46182c5d-fc8e-4c3b-b057-7059845a9c00	24362b96-1cc8-48ac-a31e-91da52e4d1b0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Amir	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 22:17:09.499937	2025-10-28 22:17:09.503
794f658e-aaed-4d1e-a0e6-4016f25af026	411dc4b0-c7f6-44ba-a7cd-dab215760984	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761694047309	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-28 23:27:27.733562	2025-10-28 23:27:27.74
488061ec-5c55-4413-9b11-6aa86f8359ec	8903720d-1010-4477-a548-0fa98558c462	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696551725	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:09:11.835174	2025-10-29 00:09:11.844
07ad903b-21e8-404c-8a71-e70577c2e485	4c81efe9-2a6a-4a07-aeaf-29b7c4f31eb5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696558540	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:09:18.564804	2025-10-29 00:09:18.568
91d57db6-ac31-4ea2-bfb6-b134393bc563	989ade00-5320-4761-bf20-992cd7b90a29	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696642148	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:10:42.16989	2025-10-29 00:10:42.172
bbde0887-3d4f-47bd-881b-72dd47c98ace	4eb7464e-9019-42dc-a025-f38b1d6b6e69	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696675507	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:11:15.525786	2025-10-29 00:11:15.528
81138227-f7a2-435b-9271-0d1b6455c653	28f932fe-f699-4ad4-9d80-39550e5f3ac1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696690383	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:11:30.402163	2025-10-29 00:11:30.403
c8ef0fa6-2875-479e-9731-be18ef0e5dba	9834faee-2e62-43c4-8bdf-e8a48c024bd0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696743563	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:12:23.595355	2025-10-29 00:12:23.599
98955a73-8685-424b-bfc9-dc41bad236c3	87edbfdb-35d1-4663-a6f8-b620d94b03cb	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696748494	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:12:28.518683	2025-10-29 00:12:28.521
6cacf39d-36ba-4eea-b220-29e4e0f27843	93363bc6-7ea7-4a68-8ac1-33752a980cfd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=dfdfs	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:12:47.265748	2025-10-29 00:12:47.268
899e5e1c-e6bd-433d-9a04-8ad9904fd4ca	3bd7e66d-a20f-4807-a359-6c8c6e5504b8	\N	https://api.dicebear.com/9.x/notionists/svg?seed=sigma	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:13:47.259669	2025-10-29 00:13:47.262
e2912d6b-f10f-4edb-9d1e-871883287f2f	38ec6f91-b621-4e9f-8b82-9ed5a4671e61	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696849967	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:14:09.983824	2025-10-29 00:14:09.985
4cd28424-ce6e-4f1e-9f0e-37790f39d604	283cfccd-ff30-45a8-9926-78e609c04fd3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696908224	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:15:08.242607	2025-10-29 00:15:08.245
6f795da1-4c3b-483e-b76e-94a4be6bf432	3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	Pumpfun example	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761696634799	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:10:34.846608	2025-10-29 00:15:12.715
648fa860-41eb-4e4c-b011-153beea397ee	f91d6d80-ccc5-4921-9957-fb7b755dde16	\N	https://api.dicebear.com/9.x/notionists/svg?seed=dwdw	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:17:54.009586	2025-10-29 00:17:54.013
eb2a3a64-5800-455f-97b5-816e2d236aa1	166ec861-bcfa-4c4d-8acc-8f2ac5ae6189	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697145305	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:19:05.34064	2025-10-29 00:19:05.344
42f97c28-8eb7-45c0-9beb-70938f133b62	dbae0c5d-16ec-4f4c-b15f-e0df6acc2109	\N	https://api.dicebear.com/9.x/notionists/svg?seed=来咯哦哦	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:19:52.74991	2025-10-29 00:19:52.753
23a7416a-059f-4fdb-a621-97ba40b2110b	5c880d5e-ee6a-4211-90f5-006eadcfbcab	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697320719	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:22:00.766531	2025-10-29 00:22:00.769
2d893600-f62b-41fc-9108-f9de3a83f5ff	032e6d49-bb4e-4bc9-b362-56fd98019629	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Jehrb	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:24:08.150823	2025-10-29 00:24:08.154
94841d40-d834-4532-9069-83d264f48098	a5809c2a-d4a8-492e-8ed1-36a5f78b3465	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697594605	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:26:34.643119	2025-10-29 00:26:34.646
a783390b-6929-4bb3-9cc3-21c57c744ac6	56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697635879	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:27:15.930339	2025-10-29 00:27:15.932
c14f1000-d13d-4bb2-84c8-8914f23f7e93	a030303d-0a0f-4db4-8a41-3ff920d4cbf2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697640911	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:27:20.931336	2025-10-29 00:27:20.933
00fd74de-7b1d-4190-be74-e709ef9b933a	acc17059-40dc-42db-9a1f-a8b0c44eaffd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=poop	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:30:06.783021	2025-10-29 00:30:06.785
7951dce2-1776-4818-8ee1-6fb2dd33768b	ae103b3c-782b-444c-afe1-c8821379980a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697858348	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:30:58.371794	2025-10-29 00:30:58.375
d59d0a5f-4507-445a-85ce-16a80ceaf79f	72a3ef7c-ffa8-4dda-b93b-77c408eedd08	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697998753	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:33:18.775475	2025-10-29 00:33:18.778
ab580d42-d43f-4839-b6cf-9a1e60ffa9a4	fd487fba-72ab-48fa-a538-9c3a4c5740b2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_7CS3VbU8	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:36:10.220357	2025-10-29 00:36:10.223
ffdfab3c-68e5-4c0e-9c91-b862218284f5	216bcae1-de1c-48de-ba21-a6fa76cc0392	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697686579	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:28:06.603049	2025-10-29 00:28:06.606
0ef74141-a3ee-4d92-98f4-372d90374403	2de0608a-3e1a-4327-86cd-2ef604e3a681	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697838009	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:30:38.034406	2025-10-29 00:30:38.038
e26adf58-9a8d-4189-879a-205c15e72d7e	2cebf2a9-8cd9-41e2-8a76-357570839646	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761697929966	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:32:09.98963	2025-10-29 00:32:09.992
2a30bd1d-0f1d-4880-8be9-7ee5e650dc32	d45e290a-0a21-48b4-834b-eb98f77f94a7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698124804	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:35:24.846106	2025-10-29 00:35:24.848
27970430-b3d4-4307-ac37-03248a93bc6b	99469d39-5637-4b0b-bd26-4c4f44eb2b46	\N	https://api.dicebear.com/9.x/notionists/svg?seed=mitchy2slow	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:36:57.899442	2025-10-29 00:36:57.903
bc3e7db3-1f18-47eb-985f-3ffbc3ae89e1	a966dc99-1640-4b20-a232-75773e31fb30	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Hhh	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:39:23.766725	2025-10-29 00:39:23.77
d091cf14-6725-48c1-96b1-ef768e156157	61d18647-ca5f-4d68-b1cc-db54df2bc1c4	This is my example cuh	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698449035	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:40:49.05934	2025-10-29 00:59:49.894
9c6dcd15-a0e4-48e9-bdbc-2ed14b7fd1e7	c694679a-47f2-416e-8e5f-34735fba5715	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698456253	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:40:56.272034	2025-10-29 00:40:56.273
ef1b22fb-2cbf-46c7-b4ea-5db986a0f461	82363044-f3aa-4e29-a736-b3cbdd007758	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698548221	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:42:28.263456	2025-10-29 00:42:28.265
a69e81df-4fcb-46f7-b066-fcad8f7b14f7	c79685d9-daa5-480f-8353-7badcec420fc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698571993	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:42:52.017263	2025-10-29 00:42:52.02
f013725f-4dbc-48d2-a176-d3148eca0f22	60aecaba-1b61-440a-8d84-586b2061c9cb	\N	https://api.dicebear.com/9.x/notionists/svg?seed=brt	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:43:02.711608	2025-10-29 00:43:02.714
a77a76fe-edbc-4149-99c0-5f07e7e6209e	1cb1f541-de5d-4706-a316-fe6a8a385289	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698593584	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:43:13.608005	2025-10-29 00:43:13.611
61e24c36-56c4-4a04-8e4c-463f3aa182b2	7d0d40d8-1dcb-4046-a514-edc567bf2e51	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698597033	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:43:17.04867	2025-10-29 00:43:17.05
8cc87ff8-a656-41b1-9120-2e392af15e62	b9dbe893-b06b-44fe-9f28-f87e4a12fa36	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698622288	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:43:42.347145	2025-10-29 00:43:42.353
0addd1d5-d3c8-46da-9123-774b5d4a87ef	761d6e2e-3ef9-421e-ab75-b3df7f1ae9fe	\N	https://api.dicebear.com/9.x/notionists/svg?seed=voiceofdefi	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:43:47.46602	2025-10-29 00:43:47.468
fb239c50-c672-43eb-82a7-f7a72f584f10	625f53b7-33e0-4802-9f30-fa2ca7595690	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698641074	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:44:01.098375	2025-10-29 00:44:01.101
1a7533f1-2943-4018-95d3-dba39423a3bf	b99e24d3-106d-4fdc-92fb-1c3fdf4b58eb	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698643520	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:44:03.543441	2025-10-29 00:44:03.546
9dc0c940-a90c-45ce-a4e3-43c8b3efaa5d	4351386e-5b33-4539-852b-dde21f0eb49e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698662550	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:44:22.574662	2025-10-29 00:44:22.579
ef7a850c-8591-45eb-adde-15bbfcdf6d68	2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698683637	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:44:43.656386	2025-10-29 00:44:43.658
844ff258-028f-4eeb-97fc-1f43b8488d59	f469da75-b67c-4377-9e73-adb6bb7d6181	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698718548	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:45:18.569106	2025-10-29 00:45:18.572
b1f20e62-bdc8-4452-90f6-4e66331971ea	7fc612ab-ad8d-4ea2-a158-e5e8f9d7f493	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698737148	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:45:37.170328	2025-10-29 00:45:37.173
3e805e99-2de7-43ac-a8df-4c61ef16b95d	a848df14-fc4a-401b-844d-3a432179a2dd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698847138	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:47:27.186588	2025-10-29 00:47:27.19
6c0e75c6-c7d4-4f1c-8cb1-aa727442369f	b2d31f7f-11de-4e79-8728-2b26fd287796	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761698881246	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:48:01.269519	2025-10-29 00:48:01.273
0b982848-d31a-4726-a07b-ea8db3b840b7	54cef451-1bbc-4dec-9bb7-ef2c8a4614c0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Bonj	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:48:52.193486	2025-10-29 00:48:52.197
20ec2abc-c7ab-4e43-a006-b303a1c35e1a	dd6176b4-0787-4d76-9cee-02e1418da80c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=EKYUE	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:50:28.911261	2025-10-29 00:50:28.915
60f7e564-ed83-4520-b88b-b37a1439ece9	ddcbbbd5-c93d-494c-b241-1bd5da77d236	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699044102	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:50:44.140364	2025-10-29 00:50:44.144
0ceed5b2-88fa-4258-939e-2cb63415b9d2	47887516-721e-4369-9fb0-918c63bb8227	\N	https://api.dicebear.com/9.x/notionists/svg?seed=aaa	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:50:54.697399	2025-10-29 00:50:54.701
bad6606b-d650-4d4c-a926-6539e3c240c0	74a1e2e7-5272-4f0b-83e0-081ad644db6a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699069445	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:51:09.466866	2025-10-29 00:51:09.471
cf4bd262-699e-476c-bba4-8bfbcef2a2fb	d4722a16-245d-47fd-a484-dc5463134142	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699083836	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:51:23.870107	2025-10-29 00:51:23.873
8ec2712f-db33-4f7c-b9f3-9e84f1b1f177	088deaa4-8a69-4d01-ac4c-a00a67444efc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=asw	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:51:35.688422	2025-10-29 00:51:35.691
58e27cda-a7ce-4835-b2fe-06183355e743	f8a7ee72-227f-4099-907d-f4762909b1e8	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699110902	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:51:50.941494	2025-10-29 00:51:50.945
3a93d571-66bb-49a1-a708-40eb83c2d7e6	c33a2a38-1810-4c21-887c-beff01604ca3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699120833	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:52:00.852734	2025-10-29 00:52:00.856
fd8b5eca-aea7-438d-9bdc-e48ed6fdc7d4	7811df35-b917-4bd4-a81d-cb5f600a9722	\N	https://api.dicebear.com/9.x/notionists/svg?seed=rip	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:54:07.860297	2025-10-29 00:54:07.864
9f2b1575-6258-4d22-a9f0-3459a11275f7	4a6a595c-f247-4f53-a589-e606cc428bc1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=larpdev	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:56:18.462012	2025-10-29 00:56:18.466
00f94ede-8c52-4bab-8475-91fdbbcee33c	769a0aa2-9ce2-4a09-8efb-697727a78239	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Tantan	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 00:58:38.673316	2025-10-29 00:58:38.678
dc3436b9-d17f-43a0-a557-27195cc77379	f859d9cc-32f1-400b-85f8-8e9ae30c79b7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=bm124608	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:02:50.945042	2025-10-29 01:02:50.95
845ebe06-25b0-4b1b-a982-4da51efb1158	765aed52-b3a6-4493-a188-545d1a84560f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761699807747	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:03:27.766543	2025-10-29 01:03:27.772
49da2c8c-4f06-4ffd-a62c-b94781ec4b0f	a95180cd-5eab-41f7-8e65-aeaed4c61165	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700032765	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:07:12.778217	2025-10-29 01:07:12.783
64bdcc9b-d104-4770-9a5d-a24daf611333	30505fa7-dbbb-45c9-b704-5498b6ce730d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700122157	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:08:42.173884	2025-10-29 01:08:42.178
0d4f2306-b17d-47f1-bed4-94eb7cbbc4e9	a7a5d784-9d7b-486e-9d66-87d610358543	\N	https://api.dicebear.com/9.x/notionists/svg?seed=jhglg	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:10:18.057612	2025-10-29 01:10:18.063
c6793e2e-6b07-44de-af76-2411905b4669	01289b67-bc83-469e-99a1-356102efe0fd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700512128	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:15:12.146258	2025-10-29 01:15:12.152
24858b2e-9ffe-4ea2-b0d4-6e52f3ca6aba	e147f9e8-31de-4af8-add4-18cd849726c1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=jaloxin	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:15:18.541894	2025-10-29 01:15:18.547
709b6832-242d-4601-84c5-b310c4ef26a9	9c59baab-dcb3-42ca-a391-196c52284ad2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700726013	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:18:46.036914	2025-10-29 01:18:46.042
d68386d3-4138-414d-85cf-8b8653d4327c	d3e4a456-7bbd-461c-8806-50dee853d118	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700808423	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:20:08.439481	2025-10-29 01:20:08.444
99929151-7a1c-400f-ad6e-be6423523a3e	d42c3b7e-e921-4ddb-9db7-510f992d8047	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701273925	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:27:53.960226	2025-10-29 01:27:53.965
94c47306-c845-4db4-9503-05498fcdd5e2	47362d13-3b20-49ce-bc3e-cb0a51905b2a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701460550	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:31:00.582842	2025-10-29 01:31:00.587
29623add-1623-42e6-9691-c2b4d0fdf541	fdaff5cc-3fff-447b-bbd2-46fa7924c8e2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701762439	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:36:02.482926	2025-10-29 01:36:02.488
43b7bcd9-e167-48dc-b3c5-31ebc2026441	ce45f9ea-0146-431f-9469-15e31de21981	\N	https://api.dicebear.com/9.x/notionists/svg?seed=yang	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:36:50.506392	2025-10-29 01:36:50.511
f494d4b2-9b5d-4b48-b966-2d8ef28b23a6	4006bc15-1d9d-4153-a29c-fb5aff8b7f2f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701910347	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:38:30.362969	2025-10-29 01:38:30.367
f5cb9ec8-026b-455b-be60-19b01516b709	73488522-358e-4e2a-8e15-6a2fa0b35475	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761700755472	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:19:15.488598	2025-10-29 01:19:15.494
4499f7ef-6881-4f78-9a93-c8a8b52c0e40	10d0b5b4-7dc2-4394-b45b-bbd5a5904e8f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=ballesvans	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:19:19.762133	2025-10-29 01:19:19.766
490eda61-53f0-4098-ba98-792f463966ba	aec40e30-e922-4f47-8552-c07c08a12e9a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701820114	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:37:00.133762	2025-10-29 01:37:00.138
e5428135-4b32-488f-9504-dba57ec06eda	05316a10-ea0f-463d-904a-83d8edb7a1f3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=liquid	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:37:57.119233	2025-10-29 01:37:57.124
a7e72f54-58e8-499e-b219-a9a4d6ed1e25	b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701883972	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:38:03.985099	2025-10-29 01:38:03.989
a65d9b6c-e242-4e41-9c72-92b03c135df3	1d9361e1-194c-452c-95eb-ff397f373423	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701953588	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:39:13.609903	2025-10-29 01:39:13.615
40b2126c-d536-4663-aade-fee7e87a8a6f	7f0a9138-5a4d-4955-8895-dc27436f10b2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=nig	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:43:22.673136	2025-10-29 01:43:22.678
dd0f2e38-57c7-42e0-b78c-69680aa9d48f	9fb265bb-79e6-434e-8014-ad7dda43a240	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Bangrizal	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:39:21.018732	2025-10-29 01:39:21.024
e4614cd1-8220-4811-9a22-ee573aefbcda	898e8852-e40d-4b2a-a8f7-3e215268febc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Moment	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:39:22.885892	2025-10-29 01:39:22.89
9718d343-2a82-4200-86a5-aef41c674b5a	1da44720-691e-486e-b9be-07466825bed2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701969467	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:39:29.483704	2025-10-29 01:39:29.488
c631601a-255c-44f2-8586-5840033db961	6aa23ecd-fe38-49a9-84f6-d3a4693534db	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702016290	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:40:16.309007	2025-10-29 01:40:16.314
82623350-41a2-42a3-abfd-14c61ace8d3a	b03668e6-821a-4e06-b541-1cd2e0ea45af	Live demo pt 3	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761701955279	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:39:15.296501	2025-10-29 01:40:20.92
c66d47b5-fcc3-4b13-8d52-15342cb0d157	e4451549-992b-41b7-b215-30a02947df70	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702070322	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:41:10.342967	2025-10-29 01:41:10.348
064fce92-eb91-4ecc-a61d-54cf41b68da1	af9b6f90-5a94-466d-b70b-e70dafd97388	\N	https://api.dicebear.com/9.x/notionists/svg?seed=PongLenis	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:41:34.984997	2025-10-29 01:41:34.989
34c69899-2dc6-450a-b008-0f912648bd80	d6fa57ef-eea9-4bdf-aff9-da0cfcf738b3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702105663	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:41:45.679724	2025-10-29 01:41:45.685
e425962c-60f3-463f-95ed-0426529208c3	946f79e6-ba79-4206-9569-9359b4e2b2dc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702155978	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:42:35.998099	2025-10-29 01:42:36.003
2d266422-3574-44a8-9716-17f1ece911e4	4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Pong-Lenis	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:43:00.7984	2025-10-29 01:43:00.803
e5ddcbc8-e54c-42fb-8c18-b3658f8e640c	9443adea-382b-4bb8-9a04-cd012d02dd4f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=nigger	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:43:35.069378	2025-10-29 01:43:35.074
1634440b-1dd9-482e-b5fa-5d9faa3a7192	5adb70d1-63a9-44bd-9427-6e3b3761f6e4	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702277193	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:44:37.210574	2025-10-29 01:44:37.216
9055c83b-8e53-47e4-a593-43ca12ce3682	9e1c1b26-c03b-4319-9e39-e477f314e814	\N	https://api.dicebear.com/9.x/notionists/svg?seed= Newjackcity25	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:44:47.556102	2025-10-29 01:44:47.56
4be51405-c4be-450d-ac67-2c8f8dd3d86f	cf32e5a8-8249-4f5c-af1e-257e58f25604	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702340870	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:45:40.912046	2025-10-29 01:45:40.917
4dcb0014-4bd7-4752-a34b-89cf6817d11b	0ca6a5ac-3840-4e16-a471-4cf03726506c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Sam	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:46:01.198631	2025-10-29 01:46:01.203
326e4901-ca8e-49ca-a702-eba31ce5735b	5cdda325-1f54-42bc-b1d1-7479913fc3f5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=shivriot	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:46:45.547516	2025-10-29 01:46:45.552
728e6aa8-4ae8-44d8-9c7e-5a809eda5962	00772767-41bc-4967-8266-5541d53b105e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=blk	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:47:27.875377	2025-10-29 01:47:27.88
c9d2e29b-2d5e-4200-b13c-beb4e018ddde	14101f28-b53d-457e-8541-d2ef6a4476a3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702500986	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:48:21.008414	2025-10-29 01:48:21.013
e8723629-e441-4bd8-9f93-8213618031ba	90562462-60be-4ce4-adb0-40a6cb291116	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702517657	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:48:37.675963	2025-10-29 01:48:37.681
cc7a5349-4551-4afa-a8f2-66b9109c7085	4e7abb3e-73cd-49ca-a439-4532da860b86	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702533060	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:48:53.537693	2025-10-29 01:48:53.574
29c8f587-9d2f-43e4-b8e8-9c20a42e14be	0b86da78-b5a6-44f0-b415-8d82e3634ee1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702563028	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:49:24.262622	2025-10-29 01:49:24.276
9d9780dc-eac5-4b60-ac7d-b22acf5320dc	c37781bb-d03a-4b8f-aa8b-972ee268014a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702701304	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:51:41.322384	2025-10-29 01:51:41.326
fff0ff67-413f-4d28-a1ca-9f0deb7003fa	fdb56e35-d998-4adc-a427-e425ed97642f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761702838437	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:53:58.452568	2025-10-29 01:53:58.455
07e1868a-58f8-4ea0-a620-a400a377eec5	ffe186a4-483f-49fc-a85e-e695f6d765fd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761703115299	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 01:58:35.319895	2025-10-29 01:58:35.323
bf862f59-4c0d-408b-a8eb-eb22454d9910	04a5a869-c6fc-420c-af21-3db6dd163169	\N	https://api.dicebear.com/9.x/notionists/svg?seed=zfaegagag	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:04:58.260794	2025-10-29 02:04:58.262
fa6e658a-bbe7-4fbd-964e-a3431663a401	2f413bac-dbf3-4ad9-909f-0bbc626ed760	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761703737824	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:08:57.841582	2025-10-29 02:08:57.843
d88b6526-f0e7-4ede-847f-dd3f4cfe77c4	30996758-d00b-4ea1-ad89-f058748ee590	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761703973683	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:12:53.843637	2025-10-29 02:12:53.845
db769aa4-9351-4fb5-a384-3556af38c9a9	021a4696-c2f7-479e-9b1d-c5b55e38dc7a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761703979860	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:12:59.879612	2025-10-29 02:12:59.88
27ae5f31-2083-4bca-8d6b-ebbaf70533f6	d6f78f80-b222-49b8-9412-eea692bcaa34	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Sykes321	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:13:13.948081	2025-10-29 02:13:13.949
b6249551-2b95-43c5-90a8-b4c1f4197bae	84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Buzz	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:29:58.277192	2025-10-29 02:29:58.279
4dce7b1d-9f07-4d87-8e39-50487acb0da9	219fe9e9-38b9-4db9-ba00-1ab5dfcc43dc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=MackleG	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:31:38.403628	2025-10-29 02:31:38.405
fcf9fffa-ed8a-4d1c-9f87-f965cfcb6dcf	2a748b8e-77a3-4c3a-ab6f-0d3011a56079	\N	https://api.dicebear.com/9.x/notionists/svg?seed=gggg	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:31:40.390137	2025-10-29 02:31:40.392
6d3cf1ca-254c-4677-9f4a-ef980de9da72	15f8e6a7-8b52-49be-b9ed-f617c5d8fba7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761705108387	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:31:50.709869	2025-10-29 02:31:50.721
5058be10-950c-4a8c-a1ea-1ba637bab44a	0a7bfd65-e7e6-40a0-90dd-ca7f6ee42dcc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=676MMT	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:36:27.314266	2025-10-29 02:36:27.315
748572c8-5ea0-4606-9294-050080c6ca5f	35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	Just a waffle guy	https://api.dicebear.com/9.x/notionists/svg?seed=waffles	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:34:35.32526	2025-10-29 02:58:15.417
0bec0a60-4744-4045-8584-2bd505b62db6	5554b546-c33e-4f48-a9bd-1fd30a8ae6de	\N	https://api.dicebear.com/9.x/notionists/svg?seed=weaver	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:22:21.769803	2025-10-29 02:22:21.771
8c544865-35e2-49d6-aa0f-c2314cdbe515	e600178a-55ed-4cac-b008-8f793c6655ec	\N	https://api.dicebear.com/9.x/notionists/svg?seed=muji	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:27:44.899962	2025-10-29 02:27:44.901
fd31d2e2-06d9-49d9-a87b-054779c546eb	37ed79db-51d0-4907-aa94-75502fa74c5e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761705130620	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:32:10.640986	2025-10-29 02:32:10.643
2061fda8-aa70-4033-81ef-fb73c6de903f	086ad0b4-1608-4c0e-babd-0d4ec0b6a0ab	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Bigkurt	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:28:02.900009	2025-10-29 02:28:02.902
e9a52db7-5236-4b27-9b40-8da35004911f	575d30c4-61b9-4646-ac18-4365a300105c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=STACKO808	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:38:16.211642	2025-10-29 02:38:16.224
360c4cd1-bf54-426a-ae6c-b5cb35144029	92595c95-7d23-42cd-a234-f7caaf0a944b	\N	https://api.dicebear.com/9.x/notionists/svg?seed=JAJA	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:41:02.072032	2025-10-29 02:41:02.089
0dbfcddf-6cc5-42b7-bc0b-b07cfc090a5d	e5275105-2102-4d2c-afda-0440b7afaab3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_5HzfeLGk	11	0	11	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:45:36.565233	2025-10-29 02:45:36.567
2850e127-223c-4bef-b4d6-bd286f4173f0	685149c0-3793-4d0f-85b4-780915e86b82	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761706125549	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:48:47.659736	2025-10-29 02:48:47.679
3a1964aa-3a11-4eba-8c72-adf84c2c7101	e8b3b6e7-fa09-41cf-9611-7eccc5d8acb6	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Dave420	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:51:48.814496	2025-10-29 02:51:48.845
4605fc80-5487-4c2b-8422-d154c0557a20	477a8b79-e143-4a9d-9973-a8cddae67200	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Fufufu	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:52:09.333233	2025-10-29 02:52:09.346
1a69355c-caad-469e-a9aa-344e39278744	7c7bb616-dc44-412d-b05f-2c34fc58929b	⣿⣿⣿⣿⣿⣿⣿⠿⠋⣉⣉⣉⣉⣉⣉⡍⠉⢉⡉⠉⠉⠉⣉⣉⣉⣉⣙⠛⠛⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⡿⠃⣴⣿⣿⣿⢟⣫⠭⣖⣛⣻⣯⣭⣭⣽⣛⣛⣓⣒⣒⣒⣒⣒⣒⣒⣢⣄⡉⠻⢿⣿⣿⣿\n⣿⣿⣿⣿⡟⠀⣾⣿⡟⢫⡖⢫⠒⣭⣵⣶⣶⣾⣶⡆⣿⣿⣿⣿⣿⣭⢩⣭⣿⣭⡝⢻⣿⣿⣶⠀⢻⣿⣿\n⣿⣿⣿⡿⠁⣼⣿⣿⣾⣯⣖⣵⡾⠿⠛⠛⠛⠛⠿⣿⣸⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣦⣿⣿⣿⡇⠸⣿⣿\n⣿⡿⠋⠀⢚⣛⣿⣿⣟⠛⣿⠁⠀⠀⠀⠀⠘⠳⢦⡄⠙⣿⣿⡿⠿⠟⠋⠁⠀⠀⠀⢙⣟⡿⠿⡿⢤⡉⠻\n⠏⢠⢢⡿⠋⣁⣤⢠⣉⠑⠺⠿⠿⠟⢉⣴⣿⣶⣦⣠⣶⣿⣿⣷⣦⠀⣴⣶⣿⣿⣿⣿⠟⠛⠛⠬⡱⡝⡀\n⠀⣿⣟⠀⡾⡿⠋⠈⠙⠿⣷⣶⣶⣾⣿⣿⣿⢿⠿⠛⢻⣿⣿⣿⣿⣄⡙⠻⣿⣧⣄⣀⣴⠋⣷⣶⡇⡿⡇\n⠀⢿⢹⡄⢱⣶⡄⠘⢿⣶⣄⠈⠙⠛⠶⠶⣶⣾⠀⢞⢉⣉⣛⣿⣿⣿⠇⣀⣨⣛⡻⣿⠟⠀⠹⡯⢞⡁⢀\n⣷⠈⠷⣉⣿⣿⣿⡀⠀⠉⠹⠀⢹⣷⣶⣆⣀⠈⠁⠹⠿⢿⣿⣿⣀⣀⣾⣿⣿⠿⠏⠀⢀⠈⠀⣿⡿⠀⣾\n⣿⣷⣄⠐⢿⣿⣿⣿⣄⠙⣶⠀⣀⠈⠉⠛⠏⢠⣷⣶⣶⣤⠀⣤⣤⡄⢀⣤⣤⡄⢰⡇⠘⠆⠀⣿⡇⢸⣿\n⣿⣿⣿⣧⠈⢿⣿⣿⣿⣧⣈⠀⢿⣿⣶⣦⠀⣀⡀⠈⠉⠉⠀⠉⠉⠁⠈⠉⠉⠀⠀⠀⠀⠀⠀⣿⡇⢸⣿\n⣿⣿⣿⣿⣷⡈⠻⣿⣿⣿⣿⣷⣄⡉⠻⠏⢠⣿⣿⣿⣶⠀⣦⣤⣤⠀⣀⣀⠀⣠⠄⢠⠀⠄⣸⣿⡇⢸⣿\n⣿⣿⣿⣿⣿⣿⣶⣈⠑⠮⣓⠾⣝⡻⠶⣤⣄⣉⡙⠛	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761705947654	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:45:47.67474	2025-10-29 02:52:49.3
b01f92f2-1749-48f7-9854-91e1f8e37a3f	c3b3a62d-a5a7-404b-8494-e6560d35da21	\N	https://api.dicebear.com/9.x/notionists/svg?seed=SHEffa777	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:54:46.847158	2025-10-29 02:54:46.864
ea9328fb-2b20-4e3b-a06e-0e0bc1125d2d	caa98de1-de63-46cc-aee4-200e6fd2285b	\N	https://api.dicebear.com/9.x/notionists/svg?seed=TrenchingDev	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:55:10.176068	2025-10-29 02:55:10.192
d8fc7e01-3ac5-482a-b89e-9f7724aeab6b	6b9280e2-476c-430b-9470-05ee75118ac6	\N	https://api.dicebear.com/9.x/notionists/svg?seed=pjgooners	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:55:40.384018	2025-10-29 02:55:40.434
347ad77e-a712-4bfb-82ca-2a227ddeb18b	cdd081b2-9679-4cf2-8659-511f5844e404	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Chota	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:55:54.975096	2025-10-29 02:55:54.989
fd4f52da-c452-49ac-8250-c52c16868d37	ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_AVT7GZBi	6	0	6	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:57:14.19755	2025-10-29 02:57:14.201
5b5f6cf8-72a1-4c53-a6ca-ec9021948148	4a944a52-b47d-4d8c-8f54-a812197fafd8	\N	https://api.dicebear.com/9.x/notionists/svg?seed=123456	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:18:43.665989	2025-10-29 03:18:43.668
e192557d-a210-4d45-a933-e46a61d97e2d	986f6e58-f06f-4981-a9a6-4d721e24cd15	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761706743448	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 02:59:03.474473	2025-10-29 02:59:03.477
1db76776-4dd7-4321-a57b-db22121c9ff0	746f0658-f3e6-44f4-bdb8-71345374be68	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708633284	0	0	0	0.00	0.00	0.00	0.00	0	2	2025-10-29 03:30:33.30551	2025-10-29 03:32:42.997
65670bbf-cea7-445b-a27e-4e742ae56a6f	0630514b-c953-4b9c-bea4-1fbe518040ef	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761707212371	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:06:52.415365	2025-10-29 03:06:52.416
101fa9ef-7c71-4863-80d3-fb06db09fe04	70a4e71e-5994-4562-979f-297adcefddac	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Kol	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:08:53.642948	2025-10-29 03:08:53.644
1381d131-4bc5-4747-b083-88a075f6c282	15f9a504-08bb-4f72-8822-a64ac8f25a80	\N	https://api.dicebear.com/9.x/notionists/svg?seed=testuser_comet	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:16:51.972142	2025-10-29 03:16:51.977
436694e4-5444-4034-89a5-d54ce1043bc7	4032207b-d99f-4ae2-8933-627a3c604461	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708132439	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:22:12.458807	2025-10-29 03:22:12.461
1a64c3b1-9703-42b3-ab45-ded2b413d79e	97d3cb0d-5f0b-407c-a606-5d3d569852ed	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708422141	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:27:02.368532	2025-10-29 03:27:02.355
56e5d030-ac9a-4701-847b-12f422fd51e9	4a8da2b8-f29a-4558-9343-bcdfa8aa003e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708448193	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:27:28.212932	2025-10-29 03:27:28.214
50193bd3-24bc-4eb5-a644-59a2a52767e3	f7748735-5996-44f2-9c3d-d90716024157	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708572153	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:29:32.175105	2025-10-29 03:29:32.177
fb2f0412-558c-4cab-a564-ce70701ea951	0c790fac-5a3a-4ae4-99be-53f2edda5cee	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Jackie75trading	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:29:38.411046	2025-10-29 03:29:38.413
2be261ed-a65c-41df-997d-887f90531378	b45daa7b-0a6a-4cfb-9b13-9b2166d17f2d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708610910	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:30:10.935327	2025-10-29 03:30:10.937
6884a70f-5993-4052-abfc-b455787fdb02	8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	Sup	https://api.dicebear.com/9.x/notionists/svg?seed=Mas	0	0	0	0.00	0.00	0.00	0.00	1	0	2025-10-29 02:58:44.445433	2025-10-29 03:32:31.144
2aeda528-13d7-4341-ae71-320eaad1abaf	99a56924-6436-455f-812d-56cddc5dd11d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708773219	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:32:53.249972	2025-10-29 03:33:06.785
dd4505cb-911e-48d7-af1e-7cdcf493f7ca	26a3a171-3b7e-4f87-b72e-9c8051be3497	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708823275	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:33:43.293099	2025-10-29 03:33:53.253
5d509685-8c3a-44af-b94a-c158a2fb8e7a	937db43f-f8a7-4267-8642-6f3b7bf7daca	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708801287	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:33:21.326013	2025-10-29 03:33:31.892
ec2bee3c-9f9b-4e80-a57c-be6ab77d1892	781a2101-8dfc-480e-a185-69fab61df3cc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=GFz2AfsZBvy5fXb6bbCj3sWDBaHtwZo5f1aryJt4nE5x	0	0	0	0.00	0.00	0.00	0.00	7	0	2025-10-29 02:48:26.9928	2025-10-29 03:35:21.679
e87a8836-864a-4bc5-938a-a67a2dd9c4de	9d34d792-33bb-475c-bf26-f5f860b23d98	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761713854336	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:57:34.385729	2025-10-29 04:57:34.387
fde0b976-ae3d-462a-83dc-9b2afb4ec1e9	6f27289a-df8a-460f-bacf-0e17c58639dc	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708840999	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:34:01.019021	2025-10-29 03:34:11.835
94346f25-e1b3-4557-8c81-28f51c6bdf1a	fab8990b-6a36-4d52-b34b-312848c2e947	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708889629	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:34:49.649451	2025-10-29 03:35:02.201
4ba31eb2-bfb9-440b-adfc-5f7b828d8927	4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761715080869	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:18:00.944226	2025-10-29 05:18:00.948
42a3382c-f8ca-4f62-a8e8-0c5f433291b6	a3e9ed93-9377-4941-81a9-d46e27dd6a00	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761708909666	0	0	0	0.00	0.00	0.00	0.00	0	1	2025-10-29 03:35:09.682493	2025-10-29 03:35:21.674
657458cd-9a23-4bbb-a546-919f24d82ad4	d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761709047548	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:37:27.586815	2025-10-29 03:37:27.593
069bf159-b1ab-42bc-8853-fbcd7c16c8ce	b7088835-6adc-4d33-bbe1-e5e28b5f1757	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761709085451	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:38:05.470032	2025-10-29 03:38:05.475
f90c591b-9077-4e40-950e-57f1bd7077d0	23cd4e4b-d8ff-4f2d-89e7-ab618a9d0aaf	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761709273544	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:41:13.560169	2025-10-29 03:41:13.564
5cc1ade9-ae95-46be-a096-c98b4f5f0ddf	2de06e9a-d111-4662-9b34-d724cc458b8c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761710275062	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 03:57:55.122192	2025-10-29 03:57:55.13
1720f1d0-5924-4e70-b817-f38726006ac0	01535e15-09e8-41f2-a97f-7f54f1342823	\N	https://api.dicebear.com/9.x/notionists/svg?seed=wuro	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:01:31.273819	2025-10-29 04:01:31.278
e35a97db-40b5-49f8-8eeb-a4bab7007b79	9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761711589074	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:19:49.310029	2025-10-29 04:19:49.294
7d005054-d1a7-4c6e-ba4c-947bddb1c94b	716ae5f2-f41b-4cb1-9319-822a5a6987b9	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761712050696	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:27:30.759677	2025-10-29 04:27:30.765
4dac9ae6-60a4-41aa-9fb1-963df8e2a6a9	6ceb9978-7422-4e7e-b0c0-db81084d2441	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Majegmi	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:27:46.316649	2025-10-29 04:27:46.335
6de23246-508a-45b4-b8fd-daaa34f0a713	8f1133f4-6cd8-4a7a-808b-00902821d4f2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761712674397	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:37:54.436384	2025-10-29 04:37:54.441
a14599ad-3088-4676-aa92-0a2d31021a37	8414dbd2-3162-42c4-8460-adc7f6cc47cb	reb	https://api.dicebear.com/9.x/notionists/svg?seed=dograt665	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:43:15.205772	2025-10-29 04:44:08.637
e5e1801c-5fc6-4e6a-8a74-1d9817533d2a	2c96b975-1e65-44b3-a81c-7353404df69a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761713514745	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 04:51:54.801808	2025-10-29 04:51:54.804
dc3cf8c2-0ad0-4f8b-8ba5-f9bbccb502a0	d8324fd0-7b47-43c7-b1f6-857bfa3502c4	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761715687199	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:28:07.277574	2025-10-29 05:28:07.301
f5b9e144-3d49-46df-89ee-988a29de8eba	b68d6333-062a-4f48-aa60-09575bdc05e7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=job	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:28:49.901032	2025-10-29 05:28:49.924
f56b7eab-2650-4399-bcfb-67abdecbd21b	8739e0c2-5683-4232-8d43-4d08468c4114	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761716710501	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:45:10.551993	2025-10-29 05:45:10.551
8ca3e4a2-44c9-4e1d-92a4-a45dbe511096	21b955c1-8e75-47af-a524-a73d617d333d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761716743283	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:45:43.320223	2025-10-29 05:45:43.318
4b5a8b57-8496-41fd-a377-5aad2f67999d	bd56d08d-5742-46cd-bc48-fb65d8d58111	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761716743348	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:45:43.367064	2025-10-29 05:45:43.365
46d32731-ae84-41c7-ae08-6f9701c74e24	945e85a5-8080-47aa-8713-dc4cf9e2b29c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=789	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 05:48:19.042763	2025-10-29 05:48:19.041
3c3c896a-9a72-4811-962e-bd4aa7417727	66b299f6-e286-40fb-9477-b5cadec8ff24	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Hhhhhhjj	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:22:07.738964	2025-10-29 06:22:07.745
d6f06ff2-c321-4f6b-8ae9-4f58d6d93fce	0165ad8b-d42e-4403-86da-1602ba4b1a4b	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720101151	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:41:41.62212	2025-10-29 06:41:41.632
4e3d1d1f-3ce7-4404-9009-3f7c4f82deec	03037084-5684-42b9-a1b1-18c53a77f0a0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720187661	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:43:07.698662	2025-10-29 06:43:07.704
4e7c595f-5bde-4066-9907-9ca036913cb9	fbeb4ac3-f135-4fb1-be50-604137dbb6c6	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720366779	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:46:06.820377	2025-10-29 06:46:06.826
6a57e650-ce42-4ede-b56b-753b7f6b5d28	1a86cce1-0689-469d-9ca7-dd915654be96	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720673432	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:51:13.478243	2025-10-29 06:51:13.484
b11f5635-7bb2-43f4-84bc-62c2f8ad8766	e6d93f80-ff40-4928-8ae3-f9de614a7567	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720689212	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:51:29.245861	2025-10-29 06:51:29.252
b2e08361-d556-4da6-b704-fcde9af80b67	e10e34e1-a154-4fe3-a539-2c415dcceda5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720707639	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:51:47.674715	2025-10-29 06:51:47.681
ea1980b1-a85d-4d7b-8104-1a6783fa15a5	194718fa-4f11-411f-9b28-ec8cd06db589	\N	https://api.dicebear.com/9.x/notionists/svg?seed=jerkoff	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:52:31.239468	2025-10-29 06:52:31.245
c63af19c-d351-41d6-ad71-2e89fa45c2fb	08bcac53-8922-471c-969b-8a6f91ba98b3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=ddrh	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:53:30.748777	2025-10-29 06:53:30.754
990e09c0-af4e-4bad-b229-db599c0720ec	1ff4ce32-6c6a-446c-834a-c0a882167901	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761720978621	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:56:18.653947	2025-10-29 06:56:18.66
6e1cf7a3-65db-49f5-ab34-c81ab5b6c249	ddd6cdb9-0669-4584-9306-2f6d2a8f7c63	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761721021617	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 06:57:01.65226	2025-10-29 06:57:01.658
9f0d7285-ec50-47ea-9848-1032a9d50754	930385ed-08d9-42ae-bd60-035bd04b655f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761722274149	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 07:17:54.186925	2025-10-29 07:17:54.191
d6e643a0-1783-442f-8445-180ee8578baa	f166a726-47ab-404b-9555-16a114a5cb89	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Arvoitus	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 07:25:59.733345	2025-10-29 07:25:59.747
ece43df9-b1cc-4c1b-bbba-4addb4b5efec	65606f48-f767-4cdf-a25f-67d6590026db	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761722789852	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 07:26:29.883412	2025-10-29 07:26:29.888
88c441e2-42fc-42df-9058-5b554fae109d	28ab8589-a339-4273-aa93-febeb92a8bb0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761724553628	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 07:55:54.093801	2025-10-29 07:55:54.098
949091ec-b55d-45af-a4c9-778e1d9666a7	9e35b9b1-561c-47b3-83a1-36ee026faf9f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761725565777	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 08:12:46.244323	2025-10-29 08:12:46.251
ddd53623-209c-4528-83b5-011cec99d0fd	a7f95bdf-4695-457e-b571-8c8197dcdc56	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761725847493	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 08:17:27.531796	2025-10-29 08:17:27.534
43cbfa13-6cee-406b-9af8-6a29bec81697	4cfa95be-699c-4019-b7e7-873475ad0fc5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761726147593	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 08:22:27.628675	2025-10-29 08:22:27.633
76c8a4c9-180f-447a-af8a-262630593b7e	b1e77b41-59db-4d17-90f6-02e6e43da951	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Rayne	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 08:40:14.617288	2025-10-29 08:40:14.625
52cb27f4-cc34-4c42-af9f-03b2131e57eb	f60bd0cd-d0ac-4d4a-8e38-077fdef9ec68	\N	https://api.dicebear.com/9.x/notionists/svg?seed=peacefuldestroy	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 08:59:35.966344	2025-10-29 08:59:35.972
532af468-2f82-4d45-a701-2feb9fb7075a	23144889-a854-43a5-ada7-d9cb5abc31f0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761728509395	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 09:01:49.436044	2025-10-29 09:01:49.436
c4730a79-7bd0-4eaf-b006-8cd5df9bec72	fddd48bf-42f4-4726-926c-3fbc3a920368	\N	https://api.dicebear.com/9.x/notionists/svg?seed=123	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 09:11:14.123616	2025-10-29 09:11:14.137
a431e029-e374-44f0-8ea1-796fbb72f0e9	90c6df87-5ce6-4917-aae7-4fdb5ed51e1a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761729927097	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 09:25:27.579888	2025-10-29 09:25:27.585
c56f3eec-e304-4b0f-900e-03ec2d298be8	90c26754-ec07-4425-a219-a4eceeb6b4d2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761730450135	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 09:34:10.225819	2025-10-29 09:34:10.232
a6b2e58d-26f7-4d23-a397-9e014d040783	a85fd10a-3ea5-4f11-9740-799d19224b70	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Akahredi	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:05:12.084894	2025-10-29 10:05:12.092
94438ab2-700f-4476-bb21-e5d09fc461ab	60da677f-b1cd-40fa-b9fb-f849dfc95f73	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761732737111	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:12:17.175519	2025-10-29 10:12:17.177
155a07cd-01ec-4647-8337-ae7c06a1f7a8	ae6cf106-8d94-4ca6-9e85-8165196a9011	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761733943491	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:32:23.537225	2025-10-29 10:32:23.554
7084ef24-904d-4ecd-a961-197931646b02	79731331-e847-4b24-b9ec-0bbf798b662d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761734198771	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:36:38.816412	2025-10-29 10:36:38.821
5f5e56e9-187c-4a7c-8aa0-b1b491af4c2b	eea76dbb-d1bd-4cbf-a042-849def0c6717	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Adnaniqbal	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:36:58.361484	2025-10-29 10:36:58.365
6552cdcc-8eb6-444f-af19-0c10ed5412c6	7520ae36-8167-4c7d-af36-722ae96843e1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=james74	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 10:56:41.634786	2025-10-29 10:56:41.645
7613b92d-f851-4502-9d40-bb0ba7f9ebcc	ba351fec-8e1f-4c07-bd69-391891e5a045	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761736790366	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 11:19:50.422507	2025-10-29 11:19:50.427
0c632b0f-4a1d-467b-8dc0-662fb694e4f4	6f37eec8-c479-419d-bc02-5dc6064b7e2e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761737266273	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 11:27:46.742159	2025-10-29 11:27:46.749
af57b587-eb4a-4387-970e-f192c4afbb43	9095d825-361c-47f5-a10d-1aa6f559f7f5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Ilya	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 11:43:00.883296	2025-10-29 11:43:00.888
5fd4c8f7-d29e-4c6d-835d-382df697b858	8d144f97-cf73-42a5-8af0-fb7146a5e8f7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=adasdasdasd	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:21:04.821756	2025-10-29 12:21:04.828
3b521334-5a5e-4b22-9365-7ac95de1ecd1	bdd37707-f355-4f71-8afc-bf4dc97648f7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761740502262	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:21:42.292774	2025-10-29 12:21:42.293
37f009fe-ec3a-4546-a8f2-d8fc5760fdbb	0cb9f593-6ce5-41cb-bcc8-1f4db7d4b933	\N	https://api.dicebear.com/9.x/notionists/svg?seed=ClanktheTank	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:27:51.486915	2025-10-29 12:27:51.493
2e4d7365-9804-4568-af9e-08e96f5d30de	447dd952-4fce-4950-b6c9-5afaa4b729e3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761741906215	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:45:06.292527	2025-10-29 12:45:06.298
d248f8ca-65a8-478e-8a07-e5574e94f248	7864a4e4-c9d5-4051-a446-140ab9fc576c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=missilk	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:53:52.521279	2025-10-29 12:53:52.527
991cd4b1-82f8-4b74-a721-a1fc027c4ba1	6c646f5a-fea6-44b0-a6e4-989ccae789c7	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761742747915	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 12:59:07.964677	2025-10-29 12:59:07.965
2d97d5ef-6aa9-4273-9449-dd5c845c89c4	af68e352-8fe4-41f7-bae1-e6fe20d5dbb2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761744172192	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 13:22:52.43719	2025-10-29 13:22:52.367
abf755ea-1c84-491b-ae6a-1febca66ae17	d948ff53-04ad-4c72-91d8-821d93fd03da	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761744625675	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 13:30:25.741616	2025-10-29 13:30:25.746
07f73e1d-4a01-46df-a918-b23b316a9c6f	cd9d1526-4892-4e8b-a929-a003033f6b67	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761744755148	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 13:32:35.226068	2025-10-29 13:32:35.228
661e7cc9-1379-4b3d-bacc-9a95f1c27c10	32735788-8647-4ccc-9ecb-54f45a69e878	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761745238560	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 13:40:38.623671	2025-10-29 13:40:38.63
2c8fe59f-9a50-42c1-b5e9-405d8ee9bf84	7d1fb7bf-87ce-41b8-8c2c-c2b67a165397	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_4kXkrRBc	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 13:54:07.303313	2025-10-29 13:54:07.315
04b3f910-3d07-4791-87c3-6763bf0a666d	76005046-8fc0-4fa2-8b8d-1916fb4940c5	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761746457885	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 14:00:58.335248	2025-10-29 14:00:58.343
0431b01f-32be-454f-8239-9b3e5d121f78	4ecb4c67-66c9-423b-bc60-570ba9e3938c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761748874616	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 14:41:14.69536	2025-10-29 14:41:14.705
18b770fc-65dc-49a3-acf9-addb51358917	5fce3886-6ad7-4732-8f29-a42c60901325	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761748943531	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 14:42:23.543624	2025-10-29 14:42:23.551
3e6632a4-2521-46c2-b711-d34fde264407	d09e8962-aa2d-4de7-90eb-dd65888d3afa	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761749255637	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 14:47:35.704696	2025-10-29 14:47:35.707
ae7fa3d7-6ba7-4eef-aa32-bee7e162ce09	d6646b35-cded-4155-96cd-15d0ba57484d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761749663728	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 14:54:23.776658	2025-10-29 14:54:23.796
86989335-8589-4e2a-aca5-1e538f0ea6f8	79808118-86e3-4dfa-a983-f49d9cc8348c	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761750239200	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:03:59.265025	2025-10-29 15:03:59.272
31230e7a-a84b-426a-b5ec-9b272025ed51	7d3915cf-5ece-4c2c-9e67-8f4589cf6948	\N	https://api.dicebear.com/9.x/notionists/svg?seed=hisolgamblesdev	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:05:16.905107	2025-10-29 15:05:16.908
b04cbeec-a7db-49ad-927a-5cd111e1f266	33ac0019-401a-4041-a2b0-8772debb3d24	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Iancollinsj	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:07:03.706708	2025-10-29 15:07:03.708
10bf1927-5fde-4034-8e4c-4cf7c2767c92	64b0f2e4-508c-4efa-8b39-0b3569451567	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761750502932	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:08:22.976887	2025-10-29 15:08:22.979
cc113e63-432d-468d-a36e-433c9acf1a8e	b0bd0f0e-f1b1-416b-afd4-57c3563e26d9	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761750564085	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:09:24.106506	2025-10-29 15:09:24.108
99964396-8520-404f-a396-51c9de9c4f70	51820bd8-2907-4c11-b27e-bfd1f34b4380	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761751898808	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:31:38.87587	2025-10-29 15:31:38.877
84338f4c-b615-4366-a4d0-c4888ef84217	e43f4a81-1e0b-492a-a38d-1d9e865b0198	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761752350382	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:39:10.43156	2025-10-29 15:39:10.433
b7ceb3e7-ea88-4f8e-8b0c-e28d82d2f493	5f8d475c-cbf4-4590-93f9-490db5f1eb48	\N	https://api.dicebear.com/9.x/notionists/svg?seed=crackanegg_	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 15:42:16.405072	2025-10-29 15:42:16.407
bee37946-a632-4cad-8464-9699e8e4cc8c	0c6c14cb-d738-4f83-b297-ca1de9fe29bd	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761753787277	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 16:03:07.310726	2025-10-29 16:03:07.315
bd668d3b-5b81-473c-a720-8cee37e5922b	fe14c16f-74c4-4e1b-8d80-59963f550d0a	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761755628365	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 16:33:48.852789	2025-10-29 16:33:48.86
23680e51-ac71-4b1d-b719-bb8656811943	9c027380-bb73-4e75-ab7c-3e056e3bd07f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761757180041	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 16:59:40.126707	2025-10-29 16:59:40.133
15ff336e-fa39-43bd-bdf8-92758ccf5ad5	be36c106-f6ff-4aad-8d00-f594a8e3efc1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=felo	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 17:02:58.602023	2025-10-29 17:02:58.605
5ab2eeac-4cec-4079-89c5-995da81ca73e	74923495-465e-44cc-9609-5c8a1ed982ba	\N	https://api.dicebear.com/9.x/notionists/svg?seed=R4vagedg0d	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 17:16:23.647968	2025-10-29 17:16:23.65
40e13255-c8fd-43f3-9467-2403a1c1f9a0	3b871c73-d474-4178-bf4c-24cbd6232f46	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761759375650	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 17:36:15.697211	2025-10-29 17:36:15.708
4fa8c5ec-4a11-463c-8d74-1cf4571f8884	eca08716-ed44-4b8d-8e7d-6d60ceed9a2d	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761759410246	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 17:36:50.297878	2025-10-29 17:36:50.301
fbbc7298-d32f-48af-9863-1d7f9c3c1471	838648ba-2efb-474b-b6a0-239b890e21e1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761760184790	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 17:49:44.873533	2025-10-29 17:49:44.881
597fd029-2c8c-4ac1-afa7-f002bc0cd093	47acb434-0d23-47dd-a22f-9687d7690126	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Cryptolord	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 18:11:55.108384	2025-10-29 18:11:55.114
708c5ea5-fb74-4920-add6-85890c12a67a	4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761762135866	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 18:22:15.909811	2025-10-29 18:22:15.926
4e12baa2-31e7-4e40-86f1-ffafa75dd665	8b1c235d-85bd-4efe-9b46-b293718b4b5b	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761762294070	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 18:24:54.24139	2025-10-29 18:24:54.252
180e2343-1e46-4e8a-a0ca-a343aafe7f39	cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Unlogic	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 18:32:59.230228	2025-10-29 18:32:59.233
8dc84520-0f59-4ccc-8620-48d5aeceeb06	df9311d2-24d6-4018-9afb-e9d114f142c2	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761764174907	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 18:56:14.968417	2025-10-29 18:56:14.972
2d7e6e9e-fbe4-4f1b-8b5e-ca4ca8e0105e	511cfc7d-4abe-4370-9616-1206d72d9e67	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761767768386	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 19:56:08.853745	2025-10-29 19:56:08.867
643ec483-ee14-4f29-870a-f9de5ac7c96b	27432bf0-e96a-4136-88ed-fe24815881e6	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761768060743	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 20:01:00.784762	2025-10-29 20:01:00.793
ad33c6ad-91ac-4f7f-ba9b-6ee112f5d62e	3a5ef17d-4776-4607-9577-75f70d4027e4	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761768598424	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 20:09:58.466646	2025-10-29 20:09:58.488
b610d0f3-1301-453e-a1b1-aced6dc0affd	125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e		https://api.dicebear.com/9.x/notionists/svg?seed=Wallet_8h7t21F8	2	0	2	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:06:56.155059	2025-10-29 21:07:06.066
80deb3fd-d35b-4b38-9c0e-96be1e7ae798	02d2ea6d-24da-4d14-b4dd-8f17bf206ff3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=我111777...	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:08:16.94448	2025-10-29 21:08:16.949
9d7ab4e9-9f97-4045-a094-f49b5a2ec184	d635cd6c-8582-413f-96ab-e25ade9843c0	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761772098432	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:08:18.454759	2025-10-29 21:08:18.46
89548371-42b0-4849-a380-e7059a623b43	ed93901b-ddb9-486f-8112-7b80af16121f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761772869853	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:21:10.320591	2025-10-29 21:21:10.328
5603de24-ec77-47ff-af71-755f1beecd22	78692077-9972-4fc9-9757-92e393af4830	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761773019745	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:23:39.809478	2025-10-29 21:23:39.814
d9526673-6e93-41c1-9c05-4a884a7dbe6b	24ac2207-ec7e-4b5b-8e8b-cb1695eb0229	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761773051886	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:24:11.90976	2025-10-29 21:24:11.913
f4caeeaf-cdd4-4c4d-9048-1a978d667626	8c3fd324-9419-40fc-ab4d-22229b75b911	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761773284920	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:28:04.969824	2025-10-29 21:28:04.987
b0781c9a-5937-424a-a97a-53524d3c17b1	42b28e35-c535-4b4d-a98b-63fb38b47bd9	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761773662167	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:34:22.639944	2025-10-29 21:34:22.648
4253a08e-4c01-4992-8e12-8aa8bc9c1114	92282eea-54e1-439f-bdab-31dee9096d4e	\N	https://api.dicebear.com/9.x/notionists/svg?seed=CryptoJack 	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:38:37.010036	2025-10-29 21:38:37.015
1a9d4c26-88a7-4b96-b9e4-71cf9b839d0c	c46e0a44-1b09-4376-b118-1cd938530be1	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761774111489	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:41:51.530635	2025-10-29 21:41:51.535
42830d81-2638-4730-aadb-fb743e80d961	e373c930-5e25-404b-a36b-0faf910436a3	\N	https://api.dicebear.com/9.x/notionists/svg?seed=@epoch_90	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 21:48:23.621215	2025-10-29 21:48:23.626
96eb9fef-c1d1-491e-8c49-439eb70d3049	0d30c1f1-038b-4e3d-846a-01bc81ca400f	\N	https://api.dicebear.com/9.x/notionists/svg?seed=Guest_1761777132443	0	0	0	0.00	0.00	0.00	0.00	0	0	2025-10-29 22:32:12.520664	2025-10-29 22:32:12.535
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, wallet_address, auth_provider, is_guest, twitter_id, twitter_handle, balance, solana_deposit_address, solana_balance, total_bets, total_wins, total_profit, created_at, referrer_id) FROM stdin;
f91d6d80-ccc5-4921-9957-fb7b755dde16	dwdw	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:17:53.992349	\N
dbae0c5d-16ec-4f4c-b15f-e0df6acc2109	来咯哦哦	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:19:52.729731	\N
5c880d5e-ee6a-4211-90f5-006eadcfbcab	Guest_1761697320719	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:22:00.748951	\N
032e6d49-bb4e-4bc9-b362-56fd98019629	Jehrb	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:24:08.129322	\N
a030303d-0a0f-4db4-8a41-3ff920d4cbf2	Guest_1761697640911	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:27:20.915499	\N
acc17059-40dc-42db-9a1f-a8b0c44eaffd	poop	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:30:06.76779	\N
ae103b3c-782b-444c-afe1-c8821379980a	Guest_1761697858348	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:30:58.353516	\N
72a3ef7c-ffa8-4dda-b93b-77c408eedd08	Guest_1761697998753	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:33:18.756602	\N
7d1fb7bf-87ce-41b8-8c2c-c2b67a165397	Wallet_4kXkrRBc	4kXkrRBcmrk7JQRUcCyor4DEJK1URsgzEXFCX9sZK4p5	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:36:47.191519	\N
99469d39-5637-4b0b-bd26-4c4f44eb2b46	mitchy2slow	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:36:57.87874	\N
82363044-f3aa-4e29-a736-b3cbdd007758	Guest_1761698548221	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:42:28.245297	\N
b9dbe893-b06b-44fe-9f28-f87e4a12fa36	Guest_1761698622288	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:43:42.292606	\N
b99e24d3-106d-4fdc-92fb-1c3fdf4b58eb	Guest_1761698643520	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:44:03.524079	\N
4351386e-5b33-4539-852b-dde21f0eb49e	Guest_1761698662550	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:44:22.555083	\N
6aa23ecd-fe38-49a9-84f6-d3a4693534db	Guest_1761702016290	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:40:16.292244	\N
2085a807-16c7-4cfa-b5cc-6fd67d6c3bf8	Guest_1761698683637	\N	guest	t	\N	\N	950.00	\N	0.000000000	1	0	0.00	2025-10-29 00:44:43.641595	\N
f469da75-b67c-4377-9e73-adb6bb7d6181	Guest_1761698718548	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:45:18.552174	\N
7fc612ab-ad8d-4ea2-a158-e5e8f9d7f493	Guest_1761698737148	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:45:37.153341	\N
54cef451-1bbc-4dec-9bb7-ef2c8a4614c0	Bonj	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:48:52.177418	\N
7811df35-b917-4bd4-a81d-cb5f600a9722	rip	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:54:07.843442	\N
1cea874b-2822-42eb-a9a2-42340d8ef54a	Wallet_GXUDQy2w	GXUDQy2w7xqbteipZbjEjueH8rUGpKSBkksiBHrUYE3s	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:00:27.538085	\N
f859d9cc-32f1-400b-85f8-8e9ae30c79b7	bm124608	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:02:50.931322	\N
765aed52-b3a6-4493-a188-545d1a84560f	Guest_1761699807747	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:03:27.748176	\N
e4451549-992b-41b7-b215-30a02947df70	Guest_1761702070322	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:41:10.32426	\N
30505fa7-dbbb-45c9-b704-5498b6ce730d	Guest_1761700122157	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:08:42.158301	\N
2a5a8384-d652-42e3-bed1-b03545d35725	dad	\N	username	f	\N	\N	0.00	\N	0.000000000	10	0	-1000.00	2025-10-27 00:37:57.880215	\N
31c9faf6-0d4f-42d3-8a57-6561b7fed8aa	new	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-27 15:23:15.756739	\N
6b97a323-188f-480a-99bb-1b5387db4b40	kol	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-27 15:36:21.374919	\N
af9b6f90-5a94-466d-b70b-e70dafd97388	PongLenis	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:41:34.972488	\N
aec40e30-e922-4f47-8552-c07c08a12e9a	Guest_1761701820114	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:37:00.116368	\N
4006bc15-1d9d-4153-a29c-fb5aff8b7f2f	Guest_1761701910347	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:38:30.35055	\N
d6fa57ef-eea9-4bdf-aff9-da0cfcf738b3	Guest_1761702105663	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:41:45.66421	\N
b3d8bd0c-dfb4-4e01-b666-9ed24c272b3f	Guest_1761701883972	\N	guest	t	\N	\N	0.00	\N	0.000000000	2	0	0.00	2025-10-29 01:38:03.972231	\N
1d9361e1-194c-452c-95eb-ff397f373423	Guest_1761701953588	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:39:13.590657	\N
a609b100-e7e3-4c8f-9f00-11dbde40d6f0	ant	\N	username	f	\N	\N	0.00	\N	0.000000000	2	0	-1000.00	2025-10-27 15:47:05.578296	\N
9fb265bb-79e6-434e-8014-ad7dda43a240	Bangrizal	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:39:21.001635	\N
1da44720-691e-486e-b9be-07466825bed2	Guest_1761701969467	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:39:29.468108	\N
946f79e6-ba79-4206-9569-9359b4e2b2dc	Guest_1761702155978	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:42:35.9797	\N
474c805b-25fd-4f34-8d85-04fe9263c7d9	Wallet_3iX4rpzt	3iX4rpztn6kmwqk3YcKgieXeY2oCNTKkBNcFehgjDWMc	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:43:08.266255	\N
9443adea-382b-4bb8-9a04-cd012d02dd4f	nigger	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:43:35.053071	\N
5adb70d1-63a9-44bd-9427-6e3b3761f6e4	Guest_1761702277193	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:44:37.19429	\N
7f0a9138-5a4d-4955-8895-dc27436f10b2	nig	\N	username	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:43:22.65698	\N
e08ad3b0-f617-4cfc-84a6-1c18e84842ac	Kyle	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 03:05:31.190869	\N
87893e5f-85c3-4314-ad30-dbe3171e4f2f	bp!	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 03:19:56.900031	\N
44c3b2b7-2212-4410-a7d2-04565bdfda9f	Wallet_sqjEHFDC	sqjEHFDCxBmwj8aufP7w36ZPFiPMp5fLvYjB9wDETW4	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 04:45:59.952576	\N
e64c73b7-f0b3-4bb3-9184-4825e6fa0d16	Guest_1761632469846	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 06:21:10.185913	\N
72f9d3d2-355d-4f07-908e-5f6187afb864	xj2k	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 15:05:05.563102	\N
85dab627-70a4-4007-917f-87cb7865ea13	Guest_1761687483783	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 21:38:03.826622	\N
c2951623-ac43-459e-b382-c0865d8660ed	Guest_1761689752562	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 22:15:52.604744	\N
60c6ea55-4171-4f7e-803e-443f38c8e9f1	Guest_1761689754618	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 22:15:54.621667	\N
b11b737d-41a6-4058-98b8-992bb5ebc085	Guest_1761689814109	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 22:16:54.110561	\N
24362b96-1cc8-48ac-a31e-91da52e4d1b0	Amir	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 22:17:09.488159	\N
38ed5c0b-fc9b-4ddd-92cd-95d4890c8bb2	trader1	\N	username	f	\N	\N	1000.00	\N	0.000000000	1	0	0.00	2025-10-27 00:02:20.764193	\N
72e306d2-207c-462c-9415-a0c7aa96a2ab	mom	\N	username	f	\N	\N	1000.00	\N	0.000000000	2	0	0.00	2025-10-27 00:07:07.134254	\N
cf32e5a8-8249-4f5c-af1e-257e58f25604	Guest_1761702340870	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:45:40.895075	\N
0ca6a5ac-3840-4e16-a471-4cf03726506c	Sam	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:46:01.184061	\N
9a0da53f-5961-4f6c-97e5-cfc3d7e7e826	Wallet_E5EqkLAC	E5EqkLACL27r3QxaQmjdShuRRcicP9ZBxF2Z8PFyL8JF	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:46:18.254075	\N
9e1c1b26-c03b-4319-9e39-e477f314e814	 Newjackcity25	\N	username	f	\N	\N	0.00	\N	0.000000000	7	0	0.00	2025-10-29 01:44:47.542961	\N
56f3cb8f-8131-44a7-a330-4c9c62cbd5ba	Guest_1761697635879	\N	guest	t	\N	\N	850.00	\N	0.000000000	2	0	0.00	2025-10-29 00:27:15.905352	\N
4ecf5cb0-41de-46cc-8e5a-a1bc617e4dd5	Pong-Lenis	\N	username	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:43:00.781607	\N
6a7477e7-12b7-4041-8d77-c9e71214b6ef	Guest_1761694392029	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-28 23:33:12.066606	\N
4c81efe9-2a6a-4a07-aeaf-29b7c4f31eb5	Guest_1761696558540	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:09:18.544275	\N
989ade00-5320-4761-bf20-992cd7b90a29	Guest_1761696642148	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:10:42.152171	\N
e2a285f7-97b4-4fe6-b423-9a6368911ef1	Wallet_FesSBVfR	FesSBVfRMvW7rF1tG7G6WyV82WjMTgABJMTDhBM5s9uL	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:10:43.121005	\N
4eb7464e-9019-42dc-a025-f38b1d6b6e69	Guest_1761696675507	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:11:15.511128	\N
28f932fe-f699-4ad4-9d80-39550e5f3ac1	Guest_1761696690383	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:11:30.3879	\N
87edbfdb-35d1-4663-a6f8-b620d94b03cb	Guest_1761696748494	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:12:28.498915	\N
93363bc6-7ea7-4a68-8ac1-33752a980cfd	dfdfs	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:12:47.251057	\N
166ec861-bcfa-4c4d-8acc-8f2ac5ae6189	Guest_1761697145305	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:19:05.327007	\N
9834faee-2e62-43c4-8bdf-e8a48c024bd0	Guest_1761696743563	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 00:12:23.567823	\N
3bd7e66d-a20f-4807-a359-6c8c6e5504b8	sigma	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:13:47.241563	\N
38ec6f91-b621-4e9f-8b82-9ed5a4671e61	Guest_1761696849967	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:14:09.971238	\N
a5809c2a-d4a8-492e-8ed1-36a5f78b3465	Guest_1761697594605	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:26:34.626729	\N
3f4a02a0-7b48-4c77-93ec-cac1a27f6c56	Guest_1761696634799	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 00:10:34.831665	\N
283cfccd-ff30-45a8-9926-78e609c04fd3	Guest_1761696908224	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:15:08.228239	\N
216bcae1-de1c-48de-ba21-a6fa76cc0392	Guest_1761697686579	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:28:06.583348	\N
d8c125df-fb1f-4755-9975-1e23ffdd006a	Wallet_GUmPFAJc	GUmPFAJcioMxWYjKmpa3zgVmdbjCWc8PNY8A5yu4SbVu	solana	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 00:13:52.241398	\N
2de0608a-3e1a-4327-86cd-2ef604e3a681	Guest_1761697838009	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:30:38.013322	\N
c694679a-47f2-416e-8e5f-34735fba5715	Guest_1761698456253	\N	guest	t	\N	\N	480.00	\N	0.000000000	3	0	0.00	2025-10-29 00:40:56.257865	\N
625f53b7-33e0-4802-9f30-fa2ca7595690	Guest_1761698641074	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:44:01.078757	\N
a848df14-fc4a-401b-844d-3a432179a2dd	Guest_1761698847138	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:47:27.170021	\N
b2d31f7f-11de-4e79-8728-2b26fd287796	Guest_1761698881246	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:48:01.2492	\N
dd6176b4-0787-4d76-9cee-02e1418da80c	EKYUE	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:50:28.897116	\N
2cebf2a9-8cd9-41e2-8a76-357570839646	Guest_1761697929966	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 00:32:09.970565	\N
ddcbbbd5-c93d-494c-b241-1bd5da77d236	Guest_1761699044102	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:50:44.124396	\N
74a1e2e7-5272-4f0b-83e0-081ad644db6a	Guest_1761699069445	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:51:09.447125	\N
d4722a16-245d-47fd-a484-dc5463134142	Guest_1761699083836	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:51:23.855755	\N
f8a7ee72-227f-4099-907d-f4762909b1e8	Guest_1761699110902	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:51:50.924083	\N
c33a2a38-1810-4c21-887c-beff01604ca3	Guest_1761699120833	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:52:00.835232	\N
73488522-358e-4e2a-8e15-6a2fa0b35475	Guest_1761700755472	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:19:15.47277	\N
d45e290a-0a21-48b4-834b-eb98f77f94a7	Guest_1761698124804	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:35:24.826845	\N
fd487fba-72ab-48fa-a538-9c3a4c5740b2	Wallet_7CS3VbU8	7CS3VbU8KpXu9VfM3BxhRtcMgk4uh3NjpXqFExcpNc4t	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:35:58.460563	\N
47887516-721e-4369-9fb0-918c63bb8227	aaa	\N	username	f	\N	\N	1.00	\N	0.000000000	1	0	0.00	2025-10-29 00:50:54.680444	\N
a2bb50e4-23d2-49dc-b201-35a2e123c2ad	Wallet_CzZU36oJ	CzZU36oJk8cMySzxYJNVcMYKit85rQhFf8ti9UDh6aQf	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:53:39.648313	\N
8903720d-1010-4477-a548-0fa98558c462	Guest_1761696551725	\N	guest	t	\N	\N	400.00	\N	0.000000000	8	0	0.00	2025-10-29 00:09:11.778047	\N
a966dc99-1640-4b20-a232-75773e31fb30	Hhh	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:39:23.745036	\N
61d18647-ca5f-4d68-b1cc-db54df2bc1c4	Guest_1761698449035	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:40:49.041662	\N
c79685d9-daa5-480f-8353-7badcec420fc	Guest_1761698571993	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:42:51.998347	\N
60aecaba-1b61-440a-8d84-586b2061c9cb	brt	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:43:02.693809	\N
a95180cd-5eab-41f7-8e65-aeaed4c61165	Guest_1761700032765	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:07:12.765905	\N
1cb1f541-de5d-4706-a316-fe6a8a385289	Guest_1761698593584	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:43:13.589471	\N
7d0d40d8-1dcb-4046-a514-edc567bf2e51	Guest_1761698597033	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:43:17.035018	\N
a7a5d784-9d7b-486e-9d66-87d610358543	jhglg	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:10:18.039695	\N
761d6e2e-3ef9-421e-ab75-b3df7f1ae9fe	voiceofdefi	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 00:43:47.44877	\N
731cebcc-9f0a-4d12-8e94-23268ffed8d4	Wallet_BALL3WHt	BALL3WHt6mUeQK16BeWEnS29uuQzEgKecC3J6f7QLoZ6	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:13:48.148656	\N
769a0aa2-9ce2-4a09-8efb-697727a78239	Tantan	\N	username	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 00:58:38.654817	\N
e147f9e8-31de-4af8-add4-18cd849726c1	jaloxin	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:15:18.522527	\N
4a6a595c-f247-4f53-a589-e606cc428bc1	larpdev	\N	username	f	\N	\N	400.00	\N	0.000000000	2	0	0.00	2025-10-29 00:56:18.444683	\N
10d0b5b4-7dc2-4394-b45b-bbd5a5904e8f	ballesvans	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:19:19.749332	\N
01289b67-bc83-469e-99a1-356102efe0fd	Guest_1761700512128	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 01:15:12.129184	\N
9c59baab-dcb3-42ca-a391-196c52284ad2	Guest_1761700726013	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:18:46.01397	\N
d42c3b7e-e921-4ddb-9db7-510f992d8047	Guest_1761701273925	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:27:53.946424	\N
47362d13-3b20-49ce-bc3e-cb0a51905b2a	Guest_1761701460550	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:31:00.567002	\N
fdaff5cc-3fff-447b-bbd2-46fa7924c8e2	Guest_1761701762439	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:36:02.465881	\N
05316a10-ea0f-463d-904a-83d8edb7a1f3	liquid	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:37:57.101173	\N
ce45f9ea-0146-431f-9469-15e31de21981	yang	\N	username	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:36:50.489067	\N
d3e4a456-7bbd-461c-8806-50dee853d118	Guest_1761700808423	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 01:20:08.424293	\N
b419cad1-e11e-4dfc-b4b1-d900bf3aff21	yes	\N	username	f	\N	\N	1000.60	\N	0.000000000	2	0	0.00	2025-10-27 16:27:18.857447	\N
088deaa4-8a69-4d01-ac4c-a00a67444efc	asw	\N	username	f	\N	\N	900.00	\N	0.000000000	2	0	0.00	2025-10-29 00:51:35.674864	\N
00772767-41bc-4967-8266-5541d53b105e	blk	\N	username	f	\N	\N	0.00	\N	0.000000000	1	0	0.00	2025-10-29 01:47:27.858664	\N
14101f28-b53d-457e-8541-d2ef6a4476a3	Guest_1761702500986	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:48:20.987469	\N
4e7abb3e-73cd-49ca-a439-4532da860b86	Guest_1761702533060	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:48:53.150536	\N
0b86da78-b5a6-44f0-b415-8d82e3634ee1	Guest_1761702563028	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:49:23.3962	\N
5cdda325-1f54-42bc-b1d1-7479913fc3f5	shivriot	\N	username	f	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 01:46:45.533462	\N
0238327d-15b3-41ae-b52c-cf223ee9832c	Wallet_3pVigeH7	3pVigeH7Lu695h9JneCzUrWxMQ9Esz4uGebjvwYvzQnX	solana	f	\N	\N	0.00	\N	0.000000000	14	0	-20.02	2025-10-29 01:47:32.856995	\N
fdb56e35-d998-4adc-a427-e425ed97642f	Guest_1761702838437	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:53:58.438897	\N
95dd72a4-124e-4b8e-a5ea-d72d7ed13090	Wallet_2Lu3KBXM	2Lu3KBXMGKDsKAkvVpENKnVSea3mRGqkf8hD3RK2sJuM	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:48:32.345151	\N
898e8852-e40d-4b2a-a8f7-3e215268febc	Moment	\N	username	f	\N	\N	350.00	\N	0.000000000	3	0	0.00	2025-10-29 01:39:22.869951	\N
bdefc13e-f3e5-49a2-b749-4aa864027d42	Wallet_CuRFLgm6	CuRFLgm6BaFi5yBTYAJvcviyy7phCqSnkFF9trwe4T2P	solana	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 01:48:32.345734	\N
90562462-60be-4ce4-adb0-40a6cb291116	Guest_1761702517657	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:48:37.658888	\N
ddf2c4e3-c85e-4c55-88c6-7a5f502a1ac0	Wallet_AVT7GZBi	AVT7GZBiqCL4KZq14u8DMBXRkCUrVg8gv5WZiudr4dna	solana	f	\N	\N	0.00	\N	0.000000000	6	0	0.00	2025-10-29 02:49:51.851479	\N
c3b3a62d-a5a7-404b-8494-e6560d35da21	SHEffa777	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:54:45.83086	\N
746f0658-f3e6-44f4-bdb8-71345374be68	Guest_1761708633284	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:30:33.288474	\N
b03668e6-821a-4e06-b541-1cd2e0ea45af	Guest_1761701955279	\N	guest	t	\N	\N	800.00	\N	0.000000000	2	0	0.00	2025-10-29 01:39:15.281101	\N
ffe186a4-483f-49fc-a85e-e695f6d765fd	Guest_1761703115299	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 01:58:35.302685	\N
04a5a869-c6fc-420c-af21-3db6dd163169	zfaegagag	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:04:58.246275	\N
2f413bac-dbf3-4ad9-909f-0bbc626ed760	Guest_1761703737824	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:08:57.8286	\N
411dc4b0-c7f6-44ba-a7cd-dab215760984	Guest_1761694047309	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-28 23:27:27.643111	\N
30996758-d00b-4ea1-ad89-f058748ee590	Guest_1761703973683	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:12:53.687863	\N
021a4696-c2f7-479e-9b1d-c5b55e38dc7a	Guest_1761703979860	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 02:12:59.86521	\N
99a56924-6436-455f-812d-56cddc5dd11d	Guest_1761708773219	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:32:53.237927	\N
937db43f-f8a7-4267-8642-6f3b7bf7daca	Guest_1761708801287	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:33:21.310743	\N
c37781bb-d03a-4b8f-aa8b-972ee268014a	Guest_1761702701304	\N	guest	t	\N	\N	150.00	\N	0.000000000	6	0	0.00	2025-10-29 01:51:41.30517	\N
26a3a171-3b7e-4f87-b72e-9c8051be3497	Guest_1761708823275	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:33:43.279815	\N
d6f78f80-b222-49b8-9412-eea692bcaa34	Sykes321	\N	username	f	\N	\N	0.00	\N	0.000000000	3	0	0.00	2025-10-29 02:13:13.935868	\N
e600178a-55ed-4cac-b008-8f793c6655ec	muji	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:27:44.883403	\N
086ad0b4-1608-4c0e-babd-0d4ec0b6a0ab	Bigkurt	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:28:02.884237	\N
5554b546-c33e-4f48-a9bd-1fd30a8ae6de	weaver	\N	username	f	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 02:22:21.752526	\N
4a944a52-b47d-4d8c-8f54-a812197fafd8	123456	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:18:43.649479	\N
6f27289a-df8a-460f-bacf-0e17c58639dc	Guest_1761708840999	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:34:01.003606	\N
219fe9e9-38b9-4db9-ba00-1ab5dfcc43dc	MackleG	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:31:38.382816	\N
fab8990b-6a36-4d52-b34b-312848c2e947	Guest_1761708889629	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:34:49.634169	\N
2a748b8e-77a3-4c3a-ab6f-0d3011a56079	gggg	\N	username	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 02:31:40.374121	\N
15f8e6a7-8b52-49be-b9ed-f617c5d8fba7	Guest_1761705108387	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:31:49.205006	\N
84b7ebcf-3c39-42fb-82cd-e6dc6dcd91ce	Buzz	\N	username	f	\N	\N	247.45	\N	0.000000000	61	0	-0.20	2025-10-29 02:29:58.257864	\N
37ed79db-51d0-4907-aa94-75502fa74c5e	Guest_1761705130620	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 02:32:10.624068	\N
0a7bfd65-e7e6-40a0-90dd-ca7f6ee42dcc	676MMT	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:36:27.299173	\N
e5275105-2102-4d2c-afda-0440b7afaab3	Wallet_5HzfeLGk	5HzfeLGk8iofrDJEEzbofQi1CZrA6nuU4cEyqDhbc6Nt	solana	f	\N	\N	0.00	\N	0.000000000	11	0	0.00	2025-10-29 02:35:35.612529	\N
e8b3b6e7-fa09-41cf-9611-7eccc5d8acb6	Dave420	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:51:41.826436	\N
a3e9ed93-9377-4941-81a9-d46e27dd6a00	Guest_1761708909666	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:35:09.670151	\N
6b9280e2-476c-430b-9470-05ee75118ac6	pjgooners	\N	username	f	\N	\N	800.00	\N	0.000000000	4	0	0.00	2025-10-29 02:55:37.161957	\N
92595c95-7d23-42cd-a234-f7caaf0a944b	JAJA	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:40:56.412122	\N
8351a8c4-d8ee-4f5c-83c2-de4d233ffdc6	Mas	\N	username	f	\N	\N	0.00	\N	0.000000000	17	0	0.00	2025-10-29 02:58:44.426502	\N
575d30c4-61b9-4646-ac18-4365a300105c	STACKO808	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:38:15.909957	\N
caa98de1-de63-46cc-aee4-200e6fd2285b	TrenchingDev	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:55:07.490324	\N
cdd081b2-9679-4cf2-8659-511f5844e404	Chota	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:55:49.880691	\N
685149c0-3793-4d0f-85b4-780915e86b82	Guest_1761706125549	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:48:46.157775	\N
90220f32-faa4-487e-92bb-405a4b086410	Wallet_EqeorZRH	EqeorZRHjtKEeLosgkhDUg7QDSe2VLW1rZFZ7BKWnrEC	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 02:48:47.710198	\N
4032207b-d99f-4ae2-8933-627a3c604461	Guest_1761708132439	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:22:12.444233	\N
7c7bb616-dc44-412d-b05f-2c34fc58929b	Guest_1761705947654	\N	guest	t	\N	\N	0.00	\N	0.000000000	7	0	0.00	2025-10-29 02:45:47.659086	\N
986f6e58-f06f-4981-a9a6-4d721e24cd15	Guest_1761706743448	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 02:59:03.453502	\N
781a2101-8dfc-480e-a185-69fab61df3cc	GFz2AfsZBvy5fXb6bbCj3sWDBaHtwZo5f1aryJt4nE5x	\N	username	f	\N	\N	539.00	\N	0.000000000	74	0	0.00	2025-10-29 02:48:26.974733	\N
0630514b-c953-4b9c-bea4-1fbe518040ef	Guest_1761707212371	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 03:06:52.400095	\N
116eace9-841b-48fa-a7ec-d3249bb3aa80	Wallet_3n8YmwGp	3n8YmwGpjLewf8ako2WJKA7udTZGmQZxGczVrn89mom9	solana	f	\N	\N	0.00	\N	0.000000000	7	0	0.00	2025-10-29 02:42:18.526295	\N
35d2b7fc-ef77-4bf8-ab22-827c4e9fbe4a	waffles	\N	username	f	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 02:34:35.305682	\N
70a4e71e-5994-4562-979f-297adcefddac	Kol	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:08:53.628807	\N
15f9a504-08bb-4f72-8822-a64ac8f25a80	testuser_comet	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:16:51.960147	\N
97d3cb0d-5f0b-407c-a606-5d3d569852ed	Guest_1761708422141	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:27:02.291529	\N
4a8da2b8-f29a-4558-9343-bcdfa8aa003e	Guest_1761708448193	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 03:27:28.197632	\N
f7748735-5996-44f2-9c3d-d90716024157	Guest_1761708572153	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:29:32.157492	\N
0c790fac-5a3a-4ae4-99be-53f2edda5cee	Jackie75trading	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:29:38.394334	\N
b45daa7b-0a6a-4cfb-9b13-9b2166d17f2d	Guest_1761708610910	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:30:10.914629	\N
b7088835-6adc-4d33-bbe1-e5e28b5f1757	Guest_1761709085451	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:38:05.453812	\N
d74e8800-cc5d-4f0b-85a2-7cc88a2a62d9	Guest_1761709047548	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 03:37:27.554862	\N
23cd4e4b-d8ff-4f2d-89e7-ab618a9d0aaf	Guest_1761709273544	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:41:13.547125	\N
2de06e9a-d111-4662-9b34-d724cc458b8c	Guest_1761710275062	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 03:57:55.104728	\N
01535e15-09e8-41f2-a97f-7f54f1342823	wuro	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:01:31.257494	\N
477a8b79-e143-4a9d-9973-a8cddae67200	Fufufu	\N	username	f	\N	\N	500.00	\N	0.000000000	5	0	0.00	2025-10-29 02:52:03.765566	\N
716ae5f2-f41b-4cb1-9319-822a5a6987b9	Guest_1761712050696	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:27:30.740008	\N
6ceb9978-7422-4e7e-b0c0-db81084d2441	Majegmi	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:27:46.293086	\N
90c26754-ec07-4425-a219-a4eceeb6b4d2	Guest_1761730450135	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 09:34:10.175568	\N
9eb9b29e-7ad2-4763-b8a7-f90f226c6c55	Guest_1761711589074	\N	guest	t	\N	\N	940.00	\N	0.000000000	2	0	0.00	2025-10-29 04:19:49.22428	b419cad1-e11e-4dfc-b4b1-d900bf3aff21
8f1133f4-6cd8-4a7a-808b-00902821d4f2	Guest_1761712674397	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:37:54.419964	\N
8414dbd2-3162-42c4-8460-adc7f6cc47cb	dograt665	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:43:15.187262	\N
2c96b975-1e65-44b3-a81c-7353404df69a	Guest_1761713514745	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:51:54.784718	\N
9d34d792-33bb-475c-bf26-f5f860b23d98	Guest_1761713854336	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 04:57:34.369883	\N
4c5c35a8-f73e-4a4e-8b51-0d4b6ba92621	Guest_1761715080869	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 05:18:00.907432	\N
d8324fd0-7b47-43c7-b1f6-857bfa3502c4	Guest_1761715687199	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 05:28:07.208802	\N
b68d6333-062a-4f48-aa60-09575bdc05e7	job	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 05:28:49.834473	\N
8739e0c2-5683-4232-8d43-4d08468c4114	Guest_1761716710501	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 05:45:10.53373	\N
21b955c1-8e75-47af-a524-a73d617d333d	Guest_1761716743283	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 05:45:43.305925	\N
bd56d08d-5742-46cd-bc48-fb65d8d58111	Guest_1761716743348	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 05:45:43.355	\N
945e85a5-8080-47aa-8713-dc4cf9e2b29c	789	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 05:48:19.023678	\N
0cb9f593-6ce5-41cb-bcc8-1f4db7d4b933	ClanktheTank	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:27:51.429113	\N
97c3ead3-ae64-4a29-89da-5d5006dcbf43	Wallet_Hy4e7jt3	Hy4e7jt3mCTfD8s2gVSVy5Kntib4jYQLrRCTnbjQMxc2	solana	f	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 05:46:18.429331	\N
66b299f6-e286-40fb-9477-b5cadec8ff24	Hhhhhhjj	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:22:07.685707	\N
0165ad8b-d42e-4403-86da-1602ba4b1a4b	Guest_1761720101151	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:41:41.507164	\N
03037084-5684-42b9-a1b1-18c53a77f0a0	Guest_1761720187661	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:43:07.687012	\N
fbeb4ac3-f135-4fb1-be50-604137dbb6c6	Guest_1761720366779	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:46:06.801249	\N
1a86cce1-0689-469d-9ca7-dd915654be96	Guest_1761720673432	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:51:13.461116	\N
e6d93f80-ff40-4928-8ae3-f9de614a7567	Guest_1761720689212	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:51:29.230746	\N
e10e34e1-a154-4fe3-a539-2c415dcceda5	Guest_1761720707639	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:51:47.6585	\N
194718fa-4f11-411f-9b28-ec8cd06db589	jerkoff	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:52:31.224753	\N
08bcac53-8922-471c-969b-8a6f91ba98b3	ddrh	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:53:30.732262	\N
1ff4ce32-6c6a-446c-834a-c0a882167901	Guest_1761720978621	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:56:18.639775	\N
ddd6cdb9-0669-4584-9306-2f6d2a8f7c63	Guest_1761721021617	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 06:57:01.63654	\N
930385ed-08d9-42ae-bd60-035bd04b655f	Guest_1761722274149	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 07:17:54.169522	\N
65606f48-f767-4cdf-a25f-67d6590026db	Guest_1761722789852	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 07:26:29.866759	\N
6f37eec8-c479-419d-bc02-5dc6064b7e2e	Guest_1761737266273	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 11:27:46.628302	\N
28ab8589-a339-4273-aa93-febeb92a8bb0	Guest_1761724553628	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 07:55:53.983912	\N
9e35b9b1-561c-47b3-83a1-36ee026faf9f	Guest_1761725565777	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 08:12:46.134969	\N
a7f95bdf-4695-457e-b571-8c8197dcdc56	Guest_1761725847493	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 08:17:27.519169	\N
76447a58-d968-443f-9a79-090bd9a93b58	Wallet_FgMszajT	FgMszajTsPXG2zxiLR7eCwYpnZRAWNF9yFFoncD7CWtn	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 08:18:17.354775	\N
a85fd10a-3ea5-4f11-9740-799d19224b70	Akahredi	\N	username	f	\N	\N	940.00	\N	0.000000000	2	0	0.00	2025-10-29 10:05:12.035034	\N
4cfa95be-699c-4019-b7e7-873475ad0fc5	Guest_1761726147593	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 08:22:27.61517	\N
b1e77b41-59db-4d17-90f6-02e6e43da951	Rayne	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 08:40:14.586453	\N
f60bd0cd-d0ac-4d4a-8e38-077fdef9ec68	peacefuldestroy	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 08:59:35.910067	\N
60da677f-b1cd-40fa-b9fb-f849dfc95f73	Guest_1761732737111	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 10:12:17.143912	\N
23144889-a854-43a5-ada7-d9cb5abc31f0	Guest_1761728509395	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 09:01:49.418918	\N
05ca184c-7970-4dab-9d99-4f49808ffd89	Wallet_5WDSySQj	5WDSySQjReFKHdU8Mses7Wt6oFR5w3ikLyqhwx3h5FL6	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 09:06:09.48068	\N
fddd48bf-42f4-4726-926c-3fbc3a920368	123	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 09:11:14.110125	\N
90c6df87-5ce6-4917-aae7-4fdb5ed51e1a	Guest_1761729927097	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 09:25:27.472567	\N
447dd952-4fce-4950-b6c9-5afaa4b729e3	Guest_1761741906215	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:45:06.240891	\N
9095d825-361c-47f5-a10d-1aa6f559f7f5	Ilya	\N	username	f	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 11:43:00.853852	\N
ae6cf106-8d94-4ca6-9e85-8165196a9011	Guest_1761733943491	\N	guest	t	\N	\N	100.00	\N	0.000000000	2	0	0.00	2025-10-29 10:32:23.519544	\N
79731331-e847-4b24-b9ec-0bbf798b662d	Guest_1761734198771	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 10:36:38.798194	\N
eea76dbb-d1bd-4cbf-a042-849def0c6717	Adnaniqbal	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 10:36:58.334746	\N
7520ae36-8167-4c7d-af36-722ae96843e1	james74	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 10:56:41.581498	\N
ba351fec-8e1f-4c07-bd69-391891e5a045	Guest_1761736790366	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 11:19:50.390182	\N
8d144f97-cf73-42a5-8af0-fb7146a5e8f7	adasdasdasd	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:21:04.770492	\N
bdd37707-f355-4f71-8afc-bf4dc97648f7	Guest_1761740502262	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:21:42.280946	\N
7864a4e4-c9d5-4051-a446-140ab9fc576c	missilk	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:53:52.488136	\N
6c646f5a-fea6-44b0-a6e4-989ccae789c7	Guest_1761742747915	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 12:59:07.936774	\N
af68e352-8fe4-41f7-bae1-e6fe20d5dbb2	Guest_1761744172192	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 13:22:52.371664	\N
d948ff53-04ad-4c72-91d8-821d93fd03da	Guest_1761744625675	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 13:30:25.723311	\N
cd9d1526-4892-4e8b-a929-a003033f6b67	Guest_1761744755148	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 13:32:35.194965	\N
f166a726-47ab-404b-9555-16a114a5cb89	Arvoitus	\N	username	f	\N	\N	980.00	\N	0.000000000	2	0	0.00	2025-10-29 07:25:59.679339	\N
32735788-8647-4ccc-9ecb-54f45a69e878	Guest_1761745238560	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 13:40:38.585873	\N
76005046-8fc0-4fa2-8b8d-1916fb4940c5	Guest_1761746457885	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 14:00:58.230361	\N
4ecb4c67-66c9-423b-bc60-570ba9e3938c	Guest_1761748874616	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 14:41:14.661835	\N
5fce3886-6ad7-4732-8f29-a42c60901325	Guest_1761748943531	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 14:42:23.53174	\N
d09e8962-aa2d-4de7-90eb-dd65888d3afa	Guest_1761749255637	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 14:47:35.683182	\N
d6646b35-cded-4155-96cd-15d0ba57484d	Guest_1761749663728	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 14:54:23.756893	\N
79808118-86e3-4dfa-a983-f49d9cc8348c	Guest_1761750239200	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:03:59.205706	\N
7d3915cf-5ece-4c2c-9e67-8f4589cf6948	hisolgamblesdev	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:05:16.890994	\N
33ac0019-401a-4041-a2b0-8772debb3d24	Iancollinsj	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:07:03.690415	\N
64b0f2e4-508c-4efa-8b39-0b3569451567	Guest_1761750502932	\N	guest	t	\N	\N	787.00	\N	0.000000000	1	0	0.00	2025-10-29 15:08:22.958869	\N
b0bd0f0e-f1b1-416b-afd4-57c3563e26d9	Guest_1761750564085	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:09:24.089144	\N
51820bd8-2907-4c11-b27e-bfd1f34b4380	Guest_1761751898808	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:31:38.856755	\N
e43f4a81-1e0b-492a-a38d-1d9e865b0198	Guest_1761752350382	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 15:39:10.414693	\N
125b5d95-f8ec-4e94-a5f3-f363dc0a1a6e	Wallet_8h7t21F8	8h7t21F8pSFFVQdzSGBFo4LMb3svmmK71Hsz6N8qsUTu	solana	f	\N	\N	0.00	\N	0.000000000	2	0	0.00	2025-10-29 20:57:53.753122	\N
5f8d475c-cbf4-4590-93f9-490db5f1eb48	crackanegg_	\N	username	f	\N	\N	950.00	\N	0.000000000	1	0	0.00	2025-10-29 15:42:16.3838	\N
02d2ea6d-24da-4d14-b4dd-8f17bf206ff3	我111777...	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:08:16.926204	\N
0c6c14cb-d738-4f83-b297-ca1de9fe29bd	Guest_1761753787277	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 16:03:07.280752	\N
fe14c16f-74c4-4e1b-8d80-59963f550d0a	Guest_1761755628365	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 16:33:48.736439	\N
9c027380-bb73-4e75-ab7c-3e056e3bd07f	Guest_1761757180041	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 16:59:40.077394	\N
be36c106-f6ff-4aad-8d00-f594a8e3efc1	felo	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 17:02:58.580864	\N
d635cd6c-8582-413f-96ab-e25ade9843c0	Guest_1761772098432	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:08:18.435554	\N
74923495-465e-44cc-9609-5c8a1ed982ba	R4vagedg0d	\N	username	f	\N	\N	950.00	\N	0.000000000	1	0	0.00	2025-10-29 17:16:23.632991	\N
3b871c73-d474-4178-bf4c-24cbd6232f46	Guest_1761759375650	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 17:36:15.654777	\N
eca08716-ed44-4b8d-8e7d-6d60ceed9a2d	Guest_1761759410246	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 17:36:50.279907	\N
838648ba-2efb-474b-b6a0-239b890e21e1	Guest_1761760184790	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 17:49:44.812444	\N
d95ce1d6-00f7-45c4-97b1-6d8f7ddd670c	Wallet_GT21nhYC	GT21nhYCiCgLoSqWzFF7MgAHpiZLPdCPTzn9BpAkMG7q	solana	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 18:08:01.923876	\N
47acb434-0d23-47dd-a22f-9687d7690126	Cryptolord	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 18:11:55.076649	\N
8b1c235d-85bd-4efe-9b46-b293718b4b5b	Guest_1761762294070	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 18:24:54.170831	\N
ed93901b-ddb9-486f-8112-7b80af16121f	Guest_1761772869853	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:21:10.211994	\N
4b097e6c-8aea-4dd0-aae3-568d7dc8b4a2	Guest_1761762135866	\N	guest	t	\N	\N	950.00	\N	0.000000000	1	0	0.00	2025-10-29 18:22:15.891225	\N
24ac2207-ec7e-4b5b-8e8b-cb1695eb0229	Guest_1761773051886	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:24:11.889699	\N
cd0aedc5-5d73-4d07-93fc-5ae1e81f01f8	Unlogic	\N	username	f	\N	\N	800.00	\N	0.000000000	2	0	0.00	2025-10-29 18:32:59.210881	\N
78692077-9972-4fc9-9757-92e393af4830	Guest_1761773019745	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 21:23:39.789191	\N
df9311d2-24d6-4018-9afb-e9d114f142c2	Guest_1761764174907	\N	guest	t	\N	\N	500.00	\N	0.000000000	1	0	0.00	2025-10-29 18:56:14.948278	\N
511cfc7d-4abe-4370-9616-1206d72d9e67	Guest_1761767768386	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 19:56:08.72481	\N
27432bf0-e96a-4136-88ed-fe24815881e6	Guest_1761768060743	\N	guest	t	\N	\N	990.00	\N	0.000000000	1	0	0.00	2025-10-29 20:01:00.767032	\N
3a5ef17d-4776-4607-9577-75f70d4027e4	Guest_1761768598424	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 20:09:58.450823	\N
8c3fd324-9419-40fc-ab4d-22229b75b911	Guest_1761773284920	\N	guest	t	\N	\N	900.00	\N	0.000000000	1	0	0.00	2025-10-29 21:28:04.949538	\N
42b28e35-c535-4b4d-a98b-63fb38b47bd9	Guest_1761773662167	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:34:22.516484	\N
92282eea-54e1-439f-bdab-31dee9096d4e	CryptoJack 	\N	username	f	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:38:36.991475	\N
c46e0a44-1b09-4376-b118-1cd938530be1	Guest_1761774111489	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 21:41:51.491234	\N
e373c930-5e25-404b-a36b-0faf910436a3	@epoch_90	\N	username	f	\N	\N	200.00	\N	0.000000000	1	0	0.00	2025-10-29 21:48:23.583005	\N
0d30c1f1-038b-4e3d-846a-01bc81ca400f	Guest_1761777132443	\N	guest	t	\N	\N	1000.00	\N	0.000000000	0	0	0.00	2025-10-29 22:32:12.459994	\N
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_name_unique UNIQUE (name);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: bets bets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: follower_cache follower_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.follower_cache
    ADD CONSTRAINT follower_cache_pkey PRIMARY KEY (id);


--
-- Name: follower_cache follower_cache_x_handle_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.follower_cache
    ADD CONSTRAINT follower_cache_x_handle_unique UNIQUE (x_handle);


--
-- Name: forum_comment_votes forum_comment_votes_comment_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comment_votes
    ADD CONSTRAINT forum_comment_votes_comment_id_user_id_unique UNIQUE (comment_id, user_id);


--
-- Name: forum_comment_votes forum_comment_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comment_votes
    ADD CONSTRAINT forum_comment_votes_pkey PRIMARY KEY (id);


--
-- Name: forum_comments forum_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_pkey PRIMARY KEY (id);


--
-- Name: forum_thread_votes forum_thread_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_thread_votes
    ADD CONSTRAINT forum_thread_votes_pkey PRIMARY KEY (id);


--
-- Name: forum_thread_votes forum_thread_votes_thread_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_thread_votes
    ADD CONSTRAINT forum_thread_votes_thread_id_user_id_unique UNIQUE (thread_id, user_id);


--
-- Name: forum_threads forum_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_threads
    ADD CONSTRAINT forum_threads_pkey PRIMARY KEY (id);


--
-- Name: kol_metrics_history kol_metrics_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kol_metrics_history
    ADD CONSTRAINT kol_metrics_history_pkey PRIMARY KEY (id);


--
-- Name: kols kols_handle_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kols
    ADD CONSTRAINT kols_handle_unique UNIQUE (handle);


--
-- Name: kols kols_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kols
    ADD CONSTRAINT kols_pkey PRIMARY KEY (id);


--
-- Name: market_metadata market_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.market_metadata
    ADD CONSTRAINT market_metadata_pkey PRIMARY KEY (id);


--
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: platform_fees platform_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: scraped_kols scraped_kols_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.scraped_kols
    ADD CONSTRAINT scraped_kols_pkey PRIMARY KEY (id);


--
-- Name: solana_deposits solana_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_deposits
    ADD CONSTRAINT solana_deposits_pkey PRIMARY KEY (id);


--
-- Name: solana_deposits solana_deposits_signature_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_deposits
    ADD CONSTRAINT solana_deposits_signature_unique UNIQUE (signature);


--
-- Name: solana_withdrawals solana_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_withdrawals
    ADD CONSTRAINT solana_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: solana_withdrawals solana_withdrawals_signature_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_withdrawals
    ADD CONSTRAINT solana_withdrawals_signature_unique UNIQUE (signature);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_follows user_follows_follower_id_following_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_following_id_unique UNIQUE (follower_id, following_id);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_solana_deposit_address_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_solana_deposit_address_unique UNIQUE (solana_deposit_address);


--
-- Name: users users_twitter_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_twitter_id_unique UNIQUE (twitter_id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: users users_wallet_address_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wallet_address_unique UNIQUE (wallet_address);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: activities activities_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bets bets_market_id_markets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_market_id_markets_id_fk FOREIGN KEY (market_id) REFERENCES public.markets(id);


--
-- Name: bets bets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments comments_market_id_markets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_market_id_markets_id_fk FOREIGN KEY (market_id) REFERENCES public.markets(id);


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_user1_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user1_id_users_id_fk FOREIGN KEY (user1_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_user2_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user2_id_users_id_fk FOREIGN KEY (user2_id) REFERENCES public.users(id);


--
-- Name: forum_comment_votes forum_comment_votes_comment_id_forum_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comment_votes
    ADD CONSTRAINT forum_comment_votes_comment_id_forum_comments_id_fk FOREIGN KEY (comment_id) REFERENCES public.forum_comments(id);


--
-- Name: forum_comment_votes forum_comment_votes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comment_votes
    ADD CONSTRAINT forum_comment_votes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forum_comments forum_comments_parent_id_forum_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_parent_id_forum_comments_id_fk FOREIGN KEY (parent_id) REFERENCES public.forum_comments(id);


--
-- Name: forum_comments forum_comments_thread_id_forum_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_thread_id_forum_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id);


--
-- Name: forum_comments forum_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forum_thread_votes forum_thread_votes_thread_id_forum_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_thread_votes
    ADD CONSTRAINT forum_thread_votes_thread_id_forum_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id);


--
-- Name: forum_thread_votes forum_thread_votes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_thread_votes
    ADD CONSTRAINT forum_thread_votes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forum_threads forum_threads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_threads
    ADD CONSTRAINT forum_threads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: kol_metrics_history kol_metrics_history_kol_id_kols_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kol_metrics_history
    ADD CONSTRAINT kol_metrics_history_kol_id_kols_id_fk FOREIGN KEY (kol_id) REFERENCES public.kols(id);


--
-- Name: market_metadata market_metadata_market_id_markets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.market_metadata
    ADD CONSTRAINT market_metadata_market_id_markets_id_fk FOREIGN KEY (market_id) REFERENCES public.markets(id);


--
-- Name: markets markets_kol_id_kols_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_kol_id_kols_id_fk FOREIGN KEY (kol_id) REFERENCES public.kols(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: platform_fees platform_fees_bet_id_bets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_bet_id_bets_id_fk FOREIGN KEY (bet_id) REFERENCES public.bets(id);


--
-- Name: platform_fees platform_fees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: positions positions_market_id_markets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_market_id_markets_id_fk FOREIGN KEY (market_id) REFERENCES public.markets(id);


--
-- Name: positions positions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: solana_deposits solana_deposits_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_deposits
    ADD CONSTRAINT solana_deposits_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: solana_withdrawals solana_withdrawals_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.solana_withdrawals
    ADD CONSTRAINT solana_withdrawals_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_achievements user_achievements_achievement_id_achievements_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_achievements_id_fk FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: user_achievements user_achievements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_follows user_follows_follower_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_users_id_fk FOREIGN KEY (follower_id) REFERENCES public.users(id);


--
-- Name: user_follows user_follows_following_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_following_id_users_id_fk FOREIGN KEY (following_id) REFERENCES public.users(id);


--
-- Name: user_profiles user_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 5sMkQs00sfqqVFkSXSQaQGBhNxhXk1a6ba8VASTiWlgDS2p2WfQeeRkHYPqOUa7

