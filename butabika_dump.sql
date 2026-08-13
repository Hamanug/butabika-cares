--
-- PostgreSQL database dump
--

\restrict ZQqtDeao8KYRBKUO4v3Y3bCDdQMjCNMRhtQbxSIGluImDoaxODLqreoURPV3NHY

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id uuid,
    therapist_id uuid,
    appointment_date date NOT NULL,
    appointment_time character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    meeting_link text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    reminder_status character varying(20) DEFAULT 'none'::character varying,
    private_notes text,
    shared_notes text
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid,
    mood_rating integer,
    mood_label character varying(50),
    entry_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT journal_entries_mood_rating_check CHECK (((mood_rating >= 1) AND (mood_rating <= 5)))
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_id uuid,
    recipient_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: mindfulness_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mindfulness_tracking (
    id integer NOT NULL,
    user_id uuid,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.mindfulness_tracking OWNER TO postgres;

--
-- Name: mindfulness_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mindfulness_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mindfulness_tracking_id_seq OWNER TO postgres;

--
-- Name: mindfulness_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mindfulness_tracking_id_seq OWNED BY public.mindfulness_tracking.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone_number character varying(20) NOT NULL,
    otp_code character varying(10) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.otps OWNER TO postgres;

--
-- Name: pre_approved_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_approved_admins (
    id integer NOT NULL,
    email character varying(255) NOT NULL
);


ALTER TABLE public.pre_approved_admins OWNER TO postgres;

--
-- Name: pre_approved_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_approved_admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pre_approved_admins_id_seq OWNER TO postgres;

--
-- Name: pre_approved_admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_approved_admins_id_seq OWNED BY public.pre_approved_admins.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    dob date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: screening_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.screening_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid,
    screening_type character varying(50) NOT NULL,
    score numeric NOT NULL,
    answers jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.screening_results OWNER TO postgres;

--
-- Name: sleep_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sleep_tracking (
    id integer NOT NULL,
    user_id uuid,
    score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sleep_tracking OWNER TO postgres;

--
-- Name: sleep_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sleep_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sleep_tracking_id_seq OWNER TO postgres;

--
-- Name: sleep_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sleep_tracking_id_seq OWNED BY public.sleep_tracking.id;


--
-- Name: stress_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stress_tracking (
    id integer NOT NULL,
    user_id uuid,
    score integer NOT NULL,
    max_score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stress_tracking OWNER TO postgres;

--
-- Name: stress_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stress_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stress_tracking_id_seq OWNER TO postgres;

--
-- Name: stress_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stress_tracking_id_seq OWNED BY public.stress_tracking.id;


--
-- Name: therapist_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.therapist_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    specialization character varying(255),
    license_number character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.therapist_profiles OWNER TO postgres;

--
-- Name: thought_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thought_records (
    id integer NOT NULL,
    user_id uuid,
    situation text NOT NULL,
    emotion text NOT NULL,
    automatic_thought text NOT NULL,
    rational_thought text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.thought_records OWNER TO postgres;

--
-- Name: thought_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thought_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thought_records_id_seq OWNER TO postgres;

--
-- Name: thought_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thought_records_id_seq OWNED BY public.thought_records.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255),
    phone_number character varying(20),
    role character varying(50) DEFAULT 'patient'::character varying,
    password_hash character varying(255),
    is_phone_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    first_name character varying(100),
    last_name character varying(100),
    occupation character varying(100),
    bio text,
    profile_picture text,
    date_of_birth date
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: mindfulness_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mindfulness_tracking ALTER COLUMN id SET DEFAULT nextval('public.mindfulness_tracking_id_seq'::regclass);


--
-- Name: pre_approved_admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_approved_admins ALTER COLUMN id SET DEFAULT nextval('public.pre_approved_admins_id_seq'::regclass);


--
-- Name: sleep_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_tracking ALTER COLUMN id SET DEFAULT nextval('public.sleep_tracking_id_seq'::regclass);


--
-- Name: stress_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_tracking ALTER COLUMN id SET DEFAULT nextval('public.stress_tracking_id_seq'::regclass);


--
-- Name: thought_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thought_records ALTER COLUMN id SET DEFAULT nextval('public.thought_records_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, therapist_id, appointment_date, appointment_time, status, meeting_link, notes, created_at, reminder_status, private_notes, shared_notes) FROM stdin;
1	44879cf7-dec1-4081-8de3-c5b64380bccf	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-12	11:30	pending	\N		2026-08-12 08:01:16.555114	none	\N	\N
2	282d223e-2054-41d6-9878-3abf6468260e	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	2026-08-13	12:00	pending	\N	reason for m ow mood	2026-08-12 13:11:31.373187	none	\N	\N
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, patient_id, mood_rating, mood_label, entry_text, created_at) FROM stdin;
af53ffc1-b72d-4bdb-8a73-77594db24c5f	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	3	Neutral	Boring	2026-08-05 12:46:02.062793
e172dfd7-d3cd-4baa-a876-809231a30ed1	f807e2de-ba10-4928-af70-4b0648987846	2	Sad	in a bad mood	2026-08-07 15:45:07.507771
8e43b532-8309-499a-9521-e853dc92f9cc	f807e2de-ba10-4928-af70-4b0648987846	4	Happy	i am now okay	2026-08-07 15:45:30.351326
d6d071bf-a458-4bad-8328-7c5328ebb577	282d223e-2054-41d6-9878-3abf6468260e	3	Neutral	Things not good 	2026-08-12 12:54:30.748044
aaf1eed4-65c5-4013-8e48-e33505c669f1	282d223e-2054-41d6-9878-3abf6468260e	3	Neutral	Financial challenges 	2026-08-12 12:55:51.252281
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, recipient_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: mindfulness_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mindfulness_tracking (id, user_id, type, created_at) FROM stdin;
1	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	body_scan	2026-08-05 12:44:23.48
2	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	grounding	2026-08-05 12:44:50
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otps (id, phone_number, otp_code, expires_at, created_at) FROM stdin;
ff14a6bb-eeea-49af-991c-81912509bfe9	256758767422	222728	2026-08-05 14:33:15.785	2026-08-05 11:23:15.794744
2bea88ae-83f2-49b8-afe1-c40f7d9568a8	256758767422	917199	2026-08-05 14:33:42.062	2026-08-05 11:23:42.070873
cb3cdb75-6219-4c43-844a-61855426c072	256758767422	990859	2026-08-05 14:35:36.004	2026-08-05 11:25:36.012662
36154928-07e7-4b9c-82b1-5d31fd9a91d4	256758767422	719454	2026-08-05 14:42:43.702	2026-08-05 11:32:43.708355
b20c38fa-dea4-4ebd-a10e-f683e31e91f9	256758767422	326243	2026-08-05 14:42:53.747	2026-08-05 11:32:53.753363
771af6fe-c50d-47f9-b121-5e2ececc86b3	256758767422	278835	2026-08-05 14:51:21.59	2026-08-05 11:41:21.597378
637fd7ce-285c-4d54-a280-0c55c56e08d1	256758767422	131138	2026-08-05 14:59:07.16	2026-08-05 11:49:07.160778
42071f2b-3d2a-47a8-b89b-071fab4ac62a	256777031798	229050	2026-08-07 18:47:32.023	2026-08-07 15:37:32.03225
5b956bda-6eae-4d9f-91cf-6d8817852cb2	256034451131	600494	2026-08-12 16:02:01.801	2026-08-12 12:52:01.802439
\.


--
-- Data for Name: pre_approved_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pre_approved_admins (id, email) FROM stdin;
1	stevkell12@gmail.com
2	kyakyo115@gmail.com
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, user_id, first_name, last_name, dob, created_at) FROM stdin;
bb4b7d62-971c-4678-8f8c-a011c7c55e7d	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	Grace	Bikumbi	\N	2026-08-12 06:47:22.541424
b3eeb39c-3410-4e37-a419-2d653950dc49	7222b18b-22e4-44b7-8730-946d2173bab0	James Rogers	Nsereko	\N	2026-08-12 06:47:22.547996
7f092e5b-d683-4ee3-8258-55a3d6e5cabb	b9900ca1-55f7-4138-948a-317ad41bcf0a	Caroline	Kisakye	\N	2026-08-12 06:47:22.550358
5d925c31-51d8-4ef0-88e1-8f45760119c5	859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	Tina	Tusiime	\N	2026-08-12 06:47:22.55303
f5648150-d931-47bb-85d8-571b2c79c658	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	Sulaiman	Kigozi	\N	2026-08-12 06:47:22.556759
04efbda2-b290-47db-97fc-515d1246bc39	3e3c2134-26db-45b2-ada7-31c702970c7a	Alice	Katengeke	\N	2026-08-12 06:47:22.559096
868500cd-0450-4ee2-baad-e90bec19f8ed	f05e0b82-6791-437d-8894-15076c6dd688	Muhanga	mpanja Christine	\N	2026-08-12 06:47:22.561093
a8e31425-be80-4dd0-aa26-76ff18c80051	0776a746-8a6d-4a2b-a2d6-a664ad561f52	Samuel	Kimbowa	\N	2026-08-12 06:47:22.563387
f3030bea-84b9-4ea1-9abd-94154d277b37	62b3a028-362b-4d90-b500-12bff5ab8c28	Ivan	Musenero	\N	2026-08-12 06:47:22.566546
bf55081a-e914-495d-9539-39962ebf61cb	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	Amos	Farris	\N	2026-08-12 06:47:22.568798
\.


--
-- Data for Name: screening_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.screening_results (id, patient_id, screening_type, score, answers, created_at) FROM stdin;
\.


--
-- Data for Name: sleep_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sleep_tracking (id, user_id, score, created_at) FROM stdin;
\.


--
-- Data for Name: stress_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stress_tracking (id, user_id, score, max_score, created_at) FROM stdin;
\.


--
-- Data for Name: therapist_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.therapist_profiles (id, user_id, specialization, license_number, created_at) FROM stdin;
29cf0345-1666-4aa6-9c1e-04d7a9e6b31f	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.54541
880682d9-9716-4c6b-9593-699917e59fc6	7222b18b-22e4-44b7-8730-946d2173bab0	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.548829
2cf6782c-d90b-4a92-9c6e-8b5f318e92db	b9900ca1-55f7-4138-948a-317ad41bcf0a	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.551301
c86160ec-1002-457f-8345-18074c609a39	859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.553851
da5138cb-505f-4da0-977b-3b74de85d3af	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.557735
4bb7e981-368b-4424-aa0e-d3ea78e20da6	3e3c2134-26db-45b2-ada7-31c702970c7a	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.559791
4e3cdd9a-de57-48ff-a17e-78c683016b3f	f05e0b82-6791-437d-8894-15076c6dd688	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.561669
d95e52e5-abe6-4e8b-ab8a-c186feaa5cab	0776a746-8a6d-4a2b-a2d6-a664ad561f52	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.564102
f7ffadec-e493-49d8-be96-bc214776f960	62b3a028-362b-4d90-b500-12bff5ab8c28	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.567397
b06864d1-5e41-4afc-8b2c-33ab5914a71d	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.569428
\.


--
-- Data for Name: thought_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thought_records (id, user_id, situation, emotion, automatic_thought, rational_thought, created_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, role_name) FROM stdin;
1	patient
2	therapist
3	admin
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone_number, role, password_hash, is_phone_verified, created_at, is_active, first_name, last_name, occupation, bio, profile_picture, date_of_birth) FROM stdin;
718dc9fc-87e3-41f3-9e71-d90b46bf6f07	\N	256758767422	patient	$2b$10$iwGAEBvLZz.FUeHweNjkA.Lsj0UmP7tSk8nzXXI6TSbSJ0f8hrAjG	t	2026-08-05 11:51:15.189929	t	\N	\N	\N	\N	\N	1998-03-05
de9733ed-eadf-464c-8377-b4b2d6b7fcb5	kyakyo115@gmail.com	\N	admin	$2b$10$58k7yJ.FRio8WVmzbHfafO7vUmMHRPbSZXIzo61uBZs0dbwj.xLXq	f	2026-08-05 13:12:05.888691	t	\N	\N	\N	\N	\N	\N
f807e2de-ba10-4928-af70-4b0648987846	semddylan@gmail.com	256777031798	patient	$2b$10$g1ZmfN7IrJP2CuirTpiLNeyyPhEtGmACIl66MPCNcL/abTQkbXAq2	t	2026-08-07 15:39:36.617308	t	Ssembatya	Dylan	mechanic	rjuyfjd uieddid diidkidkd	\N	2000-03-07
1676e683-c4de-4e7a-b6c5-d42e5e0edb8e	stevkell12@gmail.com	\N	admin	$2b$10$58k7yJ.FRio8WVmzbHfafO7vUmMHRPbSZXIzo61uBZs0dbwj.xLXq	f	2026-08-05 13:12:05.888691	t	MAYANJA	STEVEN	INFORMATION TECHNOLOGIES 		\N	\N
859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	tusiimetina@yahoo.com	+256000000004	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.55215	t	\N	\N	\N	\N	\N	\N
3e3c2134-26db-45b2-ada7-31c702970c7a	alicekatss@gmail.com	+256000000006	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.558407	t	\N	\N	\N	\N	\N	\N
f05e0b82-6791-437d-8894-15076c6dd688	mpanjatina@gmail.com	+256000000007	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56044	t	\N	\N	\N	\N	\N	\N
b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	gbikumbi@gmail.com	256774306896	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.537464	t	\N	\N	\N	\N	\N	\N
b9900ca1-55f7-4138-948a-317ad41bcf0a	linaagain2002ii@gmail.com	256775525881	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.549645	t	\N	\N	\N	\N	\N	\N
7222b18b-22e4-44b7-8730-946d2173bab0	nsereko66james@gmail.com	256772835958	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.546889	t	\N	\N	\N	\N	\N	\N
0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	kigozisulah@gmail.com	256777172572	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.554568	t	\N	\N	\N	\N	\N	\N
62b3a028-362b-4d90-b500-12bff5ab8c28	museneriio@gmail.com	256704793987	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56572	t	\N	\N	\N	\N	\N	\N
cebc5a7c-85f5-4dfe-ae71-878f904c5b76	amosfarris@gmail.com	256782261312	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.568028	t	\N	\N	\N	\N	\N	\N
0776a746-8a6d-4a2b-a2d6-a664ad561f52	kimbowas@gmail.com	256782777641	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56227	t	\N	\N	\N	\N	\N	\N
44879cf7-dec1-4081-8de3-c5b64380bccf	\N	256742760000	patient	$2b$10$/ypulZFciFo3j5jT/AJKIO/QtRiSLYos4UOdNn90m9Z8Xx7KCNdv2	t	2026-08-12 08:00:33.480759	t	\N	\N	\N	\N	\N	2000-04-11
282d223e-2054-41d6-9878-3abf6468260e	\N	256704451131	patient	$2b$10$cZArxQjWJIIinXq33Gj.S.TkJw8uJ7aVlkpPk1KzhyMyrYzb.3Fea	t	2026-08-12 12:53:27.643791	t	\N	\N	\N	\N	\N	1992-08-12
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 2, true);


--
-- Name: mindfulness_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mindfulness_tracking_id_seq', 3, true);


--
-- Name: pre_approved_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pre_approved_admins_id_seq', 2, true);


--
-- Name: sleep_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sleep_tracking_id_seq', 1, false);


--
-- Name: stress_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stress_tracking_id_seq', 1, false);


--
-- Name: thought_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thought_records_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 3, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: mindfulness_tracking mindfulness_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mindfulness_tracking
    ADD CONSTRAINT mindfulness_tracking_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: pre_approved_admins pre_approved_admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_approved_admins
    ADD CONSTRAINT pre_approved_admins_email_key UNIQUE (email);


--
-- Name: pre_approved_admins pre_approved_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_approved_admins
    ADD CONSTRAINT pre_approved_admins_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: screening_results screening_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screening_results
    ADD CONSTRAINT screening_results_pkey PRIMARY KEY (id);


--
-- Name: sleep_tracking sleep_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_tracking
    ADD CONSTRAINT sleep_tracking_pkey PRIMARY KEY (id);


--
-- Name: stress_tracking stress_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_tracking
    ADD CONSTRAINT stress_tracking_pkey PRIMARY KEY (id);


--
-- Name: therapist_profiles therapist_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_pkey PRIMARY KEY (id);


--
-- Name: thought_records thought_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thought_records
    ADD CONSTRAINT thought_records_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_name_key UNIQUE (role_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_therapist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_therapist_id_fkey FOREIGN KEY (therapist_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: mindfulness_tracking mindfulness_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mindfulness_tracking
    ADD CONSTRAINT mindfulness_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: screening_results screening_results_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screening_results
    ADD CONSTRAINT screening_results_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sleep_tracking sleep_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sleep_tracking
    ADD CONSTRAINT sleep_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stress_tracking stress_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_tracking
    ADD CONSTRAINT stress_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: therapist_profiles therapist_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: thought_records thought_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thought_records
    ADD CONSTRAINT thought_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZQqtDeao8KYRBKUO4v3Y3bCDdQMjCNMRhtQbxSIGluImDoaxODLqreoURPV3NHY

