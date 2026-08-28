--
-- PostgreSQL database dump
--

\restrict tqhxONVBUG296ELpfRu9ZXWO1chzKbcRMosHnWB8hxx2CgK8LiQImADRnbq2lgr

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

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
    shared_notes text,
    patient_joined_at timestamp without time zone,
    therapist_joined_at timestamp without time zone,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    alert_5m_sent boolean DEFAULT false
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
    deleted_at timestamp without time zone,
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
    created_at timestamp without time zone DEFAULT now(),
    cycles_completed integer DEFAULT 0
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bio text,
    occupation character varying(255),
    profile_picture character varying(255)
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bio text,
    profile_picture character varying(255),
    hourly_rate numeric(10,2),
    availability jsonb,
    title character varying(50)
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
    date_of_birth date,
    display_id character varying(10)
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

COPY public.appointments (id, patient_id, therapist_id, appointment_date, appointment_time, status, meeting_link, notes, created_at, reminder_status, private_notes, shared_notes, patient_joined_at, therapist_joined_at, started_at, ended_at, alert_5m_sent) FROM stdin;
2	282d223e-2054-41d6-9878-3abf6468260e	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	2026-08-13	12:00	expired	\N	reason for m ow mood	2026-08-12 13:11:31.373187	none	\N	\N	\N	\N	\N	\N	f
1	44879cf7-dec1-4081-8de3-c5b64380bccf	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-12	11:30	expired	https://vdo.ninja/?room=ButabikaCares_Session_1&vdo=1&autostart=1		2026-08-12 08:01:16.555114	none	\N	\N	\N	\N	\N	\N	f
3	f807e2de-ba10-4928-af70-4b0648987846	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-13	01:42	expired	https://vdo.ninja/?room=ButabikaCares_Session_3&vdo=1&autostart=1		2026-08-13 01:40:10.937337	none	\N	\N	\N	\N	\N	\N	f
4	44879cf7-dec1-4081-8de3-c5b64380bccf	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	11:30	expired	https://vdo.ninja/?room=ButabikaCares_Session_4&vdo=1&autostart=1		2026-08-15 10:40:04.580707	none	\N	\N	\N	\N	\N	\N	f
5	f807e2de-ba10-4928-af70-4b0648987846	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	11:30	expired	https://vdo.ninja/?room=ButabikaCares_Session_5&vdo=1&autostart=1		2026-08-15 11:02:24.664839	none	\N	\N	\N	2026-08-15 11:48:03.559189	\N	\N	t
6	f807e2de-ba10-4928-af70-4b0648987846	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	15:30	completed	https://vdo.ninja/?room=ButabikaCares_Session_6&vdo=1&autostart=1	general mental health	2026-08-15 15:23:45.815202	none	\N	\N	2026-08-15 15:31:41.513172	2026-08-15 15:32:02.084113	2026-08-15 15:32:02.089069	2026-08-15 15:35:02.924297	f
13	44879cf7-dec1-4081-8de3-c5b64380bccf	7222b18b-22e4-44b7-8730-946d2173bab0	2026-08-18	11:42	completed	https://vdo.ninja/?room=ButabikaCares_Session_13&vdo=1&autostart=1		2026-08-18 08:34:20.325714	none	\N	\N	2026-08-18 08:37:53.270788	2026-08-18 08:37:23.416177	2026-08-18 08:37:53.272557	2026-08-18 08:40:18.643947	f
17	cd54ed34-b109-43b1-99de-b3bf7c6b306f	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-18	14:30	completed	https://vdo.ninja/?room=ButabikaCares_Session_17&vdo=1&autostart=1	The patient was seen today, recently reported having suicidal ideations due to a relationship breakdown. In july..\nShe reports having no ideations or attempts as of today.  She coping with stress by doing physical activity, especially jogging to manage stress.\n\nShe was still taken through effective ways of managing stress.\n\nPlan;\nFinancial skills training\nContinue with stress management\nContinue with assessments on depression and anxiety on the platform for observation.\n	2026-08-18 10:24:01.28344	1h	\N	\N	2026-08-18 11:36:50.522499	2026-08-18 11:26:46.956795	2026-08-18 11:36:50.526702	2026-08-18 11:56:51.358707	t
22	a2cd1799-8963-4d37-ae99-6b1acce73a50	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-22	16:00	expired	\N	I think I’m losing myself. 	2026-08-22 10:43:20.361924	none	\N	\N	\N	\N	\N	\N	f
7	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	16:45	active	https://vdo.ninja/?room=ButabikaCares_Session_7&vdo=1&autostart=1	Mental health 	2026-08-15 13:38:57.192399	none	\N	\N	2026-08-15 13:45:18.683528	2026-08-15 13:51:18.324286	2026-08-15 13:51:18.326805	\N	t
26	aa1ba1e2-e311-403f-ba6c-def570f93211	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-26	10:01	completed	https://vdo.ninja/?room=ButabikaCares_Session_26&vdo=1&autostart=1	session, had with the patient.\n	2026-08-26 07:01:12.049692	none	\N	\N	2026-08-26 07:12:29.685573	2026-08-26 07:07:53.799607	2026-08-26 07:12:29.688354	2026-08-26 07:27:20.960728	t
8	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	16:54	completed	https://vdo.ninja/?room=ButabikaCares_Session_8&vdo=1&autostart=1	Head	2026-08-15 13:52:15.176981	none	\N	\N	2026-08-15 13:55:03.30114	2026-08-15 13:53:20.764684	2026-08-15 13:55:03.310174	2026-08-15 14:02:24.243175	f
14	44879cf7-dec1-4081-8de3-c5b64380bccf	7222b18b-22e4-44b7-8730-946d2173bab0	2026-08-18	11:42	completed	https://vdo.ninja/?room=ButabikaCares_Session_14&vdo=1&autostart=1	client came in late 	2026-08-18 08:40:44.59306	none	\N	\N	2026-08-18 08:42:15.733856	2026-08-18 08:42:58.024022	2026-08-18 08:42:58.027821	2026-08-18 08:44:59.417682	f
12	601d5e03-a8f3-4997-b17f-fb07a003a915	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-19	13:00	expired	https://vdo.ninja/?room=ButabikaCares_Session_12&vdo=1&autostart=1	dealing with anxiety	2026-08-18 08:31:31.921516	1h	\N	\N	\N	2026-08-18 13:58:19.428614	\N	\N	t
9	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	17:04	active	https://vdo.ninja/?room=ButabikaCares_Session_9&vdo=1&autostart=1		2026-08-15 14:04:32.681409	none	\N	\N	2026-08-15 14:06:40.218307	2026-08-15 14:05:38.191429	2026-08-15 14:06:40.220174	\N	f
18	f0efea73-a97c-423c-bd05-aa38d49778e2	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-19	14:30	expired	https://vdo.ninja/?room=ButabikaCares_Session_18&vdo=1&autostart=1		2026-08-18 14:42:03.192892	1h	\N	\N	\N	\N	\N	\N	f
16	aa1ba1e2-e311-403f-ba6c-def570f93211	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-18	13:30	completed	https://vdo.ninja/?room=ButabikaCares_Session_16&vdo=1&autostart=1	General Discussion \nDiscussion, on his mntal health.\nhe reports poor sexual health and inactivity.\n\nplan. \nSchedule an appointment with a sexual therapist\nRoutine straucturing\nWork interview\nRedo the MoHOST.	2026-08-18 10:08:35.167408	none	\N	\N	2026-08-18 10:31:50.401791	2026-08-18 10:25:28.704647	2026-08-18 10:31:50.410303	2026-08-18 10:47:50.586194	f
15	44879cf7-dec1-4081-8de3-c5b64380bccf	7222b18b-22e4-44b7-8730-946d2173bab0	2026-08-18	11:50	completed	https://vdo.ninja/?room=ButabikaCares_Session_15&vdo=1&autostart=1	Mental health	2026-08-18 08:44:46.674115	none	\N	\N	2026-08-18 08:45:13.72913	2026-08-18 08:45:21.505181	2026-08-18 08:45:21.507435	2026-08-18 08:49:23.229495	f
20	ec2b7ea5-5340-4ded-9480-092b717942fc	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-19	09:37	expired	\N	I have financial distress to the extent of wanting to commit suicide. How can I go about it?	2026-08-19 06:38:05.010882	none	\N	\N	\N	\N	\N	\N	f
19	ec2b7ea5-5340-4ded-9480-092b717942fc	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-19	09:29	completed	https://vdo.ninja/?room=ButabikaCares_Session_19&vdo=1&autostart=1	I have a financial distress, I need some guidance. It has caused much depression and I fill like commiting suicide.	2026-08-19 06:30:19.327297	none	\N	\N	\N	2026-08-19 06:33:47.130211	\N	2026-08-19 06:34:00.595841	t
10	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	2026-08-15	17:11	completed	https://vdo.ninja/?room=ButabikaCares_Session_10&vdo=1&autostart=1	The patient seems to be experiencing severe drug use syndrome 	2026-08-15 14:11:36.928401	none	\N	\N	2026-08-15 14:12:51.099757	2026-08-15 14:11:53.442207	2026-08-15 14:12:51.103402	2026-08-15 14:13:48.790607	f
11	cd54ed34-b109-43b1-99de-b3bf7c6b306f	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-18	12:00	completed	https://vdo.ninja/?room=ButabikaCares_Session_11&vdo=1&autostart=1	Past relationship trauma	2026-08-17 15:33:16.205997	1h	\N	\N	\N	2026-08-18 10:05:37.467919	\N	2026-08-18 10:20:49.016373	t
23	601d5e03-a8f3-4997-b17f-fb07a003a915	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-24	14:30	completed	https://vdo.ninja/?room=ButabikaCares_Session_23&vdo=1&autostart=1		2026-08-24 10:10:18.458683	none	\N	\N	\N	2026-08-24 11:50:03.803147	\N	2026-08-24 11:50:11.655153	f
24	601d5e03-a8f3-4997-b17f-fb07a003a915	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-24	14:51	completed	https://vdo.ninja/?room=ButabikaCares_Session_24&vdo=1&autostart=1	Tusiime Corrins \n32 years old \nSeeking  on how to control anxiety since he started working with Kampala youth recovery foundation 	2026-08-24 11:51:44.101589	none	\N	\N	2026-08-24 11:56:25.931348	2026-08-24 11:54:41.705409	2026-08-24 11:56:25.937087	2026-08-24 12:00:35.625041	t
21	a9979c97-7847-466d-a7dd-2a6757f78361	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-20	14:24	expired	https://vdo.ninja/?room=ButabikaCares_Session_21&vdo=1&autostart=1	Ask some questions about mentorship and discuss a few things . 	2026-08-20 11:28:55.569087	none	\N	\N	\N	2026-08-20 11:48:28.676901	\N	\N	t
27	a9979c97-7847-466d-a7dd-2a6757f78361	62b3a028-362b-4d90-b500-12bff5ab8c28	2026-08-26	10:44	completed	https://vdo.ninja/?room=ButabikaCares_Session_27&vdo=1&autostart=1	A small session 	2026-08-26 07:44:18.795628	none	\N	\N	2026-08-26 07:47:13.691051	2026-08-26 07:45:13.120454	2026-08-26 07:47:13.69287	2026-08-26 07:56:02.089699	f
25	b9badb8c-54fd-4d72-aec0-4f7b30cf4828	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-26	10:05	completed	https://vdo.ninja/?room=ButabikaCares_Session_25&vdo=1&autostart=1		2026-08-26 06:55:22.085986	none	\N	\N	2026-08-26 07:06:20.294391	2026-08-26 07:03:46.300498	2026-08-26 07:06:20.299329	2026-08-26 07:07:43.265092	f
28	e3030b2e-cf60-426c-a450-88aa80c20f38	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-26	11:12	active	https://vdo.ninja/?room=ButabikaCares_Session_28&vdo=1&autostart=1		2026-08-26 08:12:43.988282	none	\N	\N	2026-08-26 08:21:25.674267	2026-08-26 08:16:38.962089	2026-08-26 08:21:25.679789	\N	t
30	8b9a933b-daba-4b63-b737-c28c758f7be6	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-27	09:30	pending	\N	Review of recovery journey 	2026-08-26 09:24:09.443698	none	\N	\N	\N	\N	\N	\N	f
29	e3030b2e-cf60-426c-a450-88aa80c20f38	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-26	11:35	expired	\N	Stress related disorders 	2026-08-26 08:34:18.362219	none	\N	\N	\N	\N	\N	\N	f
31	297cd794-4a52-4685-83e8-c7ae82f037f5	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	2026-08-26	10:34	pending	\N		2026-08-26 19:34:28.002741	none	\N	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, patient_id, mood_rating, mood_label, entry_text, created_at, deleted_at) FROM stdin;
af53ffc1-b72d-4bdb-8a73-77594db24c5f	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	3	Neutral	Boring	2026-08-05 12:46:02.062793	\N
e172dfd7-d3cd-4baa-a876-809231a30ed1	f807e2de-ba10-4928-af70-4b0648987846	2	Sad	in a bad mood	2026-08-07 15:45:07.507771	\N
8e43b532-8309-499a-9521-e853dc92f9cc	f807e2de-ba10-4928-af70-4b0648987846	4	Happy	i am now okay	2026-08-07 15:45:30.351326	\N
d6d071bf-a458-4bad-8328-7c5328ebb577	282d223e-2054-41d6-9878-3abf6468260e	3	Neutral	Things not good 	2026-08-12 12:54:30.748044	\N
aaf1eed4-65c5-4013-8e48-e33505c669f1	282d223e-2054-41d6-9878-3abf6468260e	3	Neutral	Financial challenges 	2026-08-12 12:55:51.252281	\N
1f2818c9-82a6-4954-8c77-c26760f2fa34	44879cf7-dec1-4081-8de3-c5b64380bccf	5	Great	great	2026-08-13 00:14:08.855163	2026-08-13 02:50:13.123518
0204b32d-6382-4444-9aed-2ca04545c4b6	44879cf7-dec1-4081-8de3-c5b64380bccf	1	Very Sad	very depressed	2026-08-13 00:14:18.148405	2026-08-13 02:50:15.089507
9d2a87ac-deaa-49cb-8820-14e95c2e744b	44879cf7-dec1-4081-8de3-c5b64380bccf	5	Great	Absolutely terrible day. Everything went wrong, I feel completely exhausted and depressed.	2026-08-13 00:52:37.082662	2026-08-13 02:50:48.074354
6ea1cc4b-891c-49f2-b3e6-2f73bb81f95c	44879cf7-dec1-4081-8de3-c5b64380bccf	2	Sad	feeling sad 	2026-08-13 00:13:48.729924	2026-08-13 02:50:50.340712
0e0e6c00-10d4-4641-bfda-f4e9cca1fdb1	44879cf7-dec1-4081-8de3-c5b64380bccf	3	Neutral	stale day	2026-08-13 00:13:57.834812	2026-08-13 02:50:52.398387
94209993-10a2-476f-a74b-5a70bc3942e4	44879cf7-dec1-4081-8de3-c5b64380bccf	4	Happy	feeling okay	2026-08-13 00:13:39.843236	2026-08-13 02:50:55.016947
8402e7f5-4522-4ebb-8cca-62b8c57515e9	44879cf7-dec1-4081-8de3-c5b64380bccf	5	Great	was generally a boring unlucky luck day not much to look back to	2026-08-13 02:51:30.594461	2026-08-13 03:09:17.75034
d530dbc1-cb62-41ac-87b0-33ac10b1605c	44879cf7-dec1-4081-8de3-c5b64380bccf	5	Great	had a sad day generally	2026-08-13 03:09:31.998874	\N
e9ea8096-b20e-4a29-a555-ba9913fb0f5c	44879cf7-dec1-4081-8de3-c5b64380bccf	1	Very Sad	had a very bad day today 	2026-08-13 10:41:54.041148	\N
9952d731-0f47-4335-a034-8bedf78efd3f	44879cf7-dec1-4081-8de3-c5b64380bccf	4	Happy	woke up feeling fresh	2026-08-18 09:05:26.944566	\N
afe6096b-7bad-430c-b9aa-4da5dba47d59	44879cf7-dec1-4081-8de3-c5b64380bccf	5	Great	im not feeling so good day is badish but not so bad	2026-08-18 09:06:03.033089	\N
dc7b704a-0f7b-4531-bb9b-bbe8d52e97ae	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	2	Sad	Salary	2026-08-18 13:51:28.833039	\N
4236b249-0f88-4b70-b5c4-a43ab76a5d25	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	5	Great	Gratitude for the opportunity to renew my path	2026-08-26 04:28:35.652292	\N
298e99e7-a1ad-4d55-a5a0-aa1406530700	b9badb8c-54fd-4d72-aec0-4f7b30cf4828	3	Neutral	With the session we had i believe I will improve 	2026-08-26 07:11:30.968201	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, recipient_id, content, is_read, created_at) FROM stdin;
967d087e-9f2b-4d68-a0c3-8ee9855f51fe	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	f807e2de-ba10-4928-af70-4b0648987846	hello	t	2026-08-13 01:46:35.240986
73dc8b7d-f784-452c-ae78-7801a10b3999	f807e2de-ba10-4928-af70-4b0648987846	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	hello	t	2026-08-15 11:33:06.637158
f15fc4bc-fec8-4c27-acf9-aa5c67c3bb14	f807e2de-ba10-4928-af70-4b0648987846	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	hello	t	2026-08-15 15:47:55.843399
faa5d663-6c78-4cbc-be18-81856b36bd11	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	f807e2de-ba10-4928-af70-4b0648987846	How can i help u	t	2026-08-15 15:48:08.44717
3132458e-f203-4f95-8071-f19335a07947	44879cf7-dec1-4081-8de3-c5b64380bccf	62b3a028-362b-4d90-b500-12bff5ab8c28	hello is this working perfectly	t	2026-08-18 12:50:20.764536
427e050c-4d24-4436-89cb-9c3b1ee1d8f7	62b3a028-362b-4d90-b500-12bff5ab8c28	44879cf7-dec1-4081-8de3-c5b64380bccf	Perfect	f	2026-08-18 14:56:18.891156
d8c72545-03c1-4100-ac57-c3b0d74e5c65	62b3a028-362b-4d90-b500-12bff5ab8c28	44879cf7-dec1-4081-8de3-c5b64380bccf	Kindly schedule a session tomorrow afternoon. We shl 	f	2026-08-18 14:56:36.37484
7935350f-a48e-4853-87d1-d9b61fcdec9c	62b3a028-362b-4d90-b500-12bff5ab8c28	44879cf7-dec1-4081-8de3-c5b64380bccf	We shall attend to you.	f	2026-08-18 14:56:46.272425
76592b6e-2ab4-4df5-b887-680e73d1d6ff	62b3a028-362b-4d90-b500-12bff5ab8c28	44879cf7-dec1-4081-8de3-c5b64380bccf	 Thanks	f	2026-08-18 14:56:52.284836
c5e21a18-ba62-4ec8-83cd-08643db1defd	62b3a028-362b-4d90-b500-12bff5ab8c28	44879cf7-dec1-4081-8de3-c5b64380bccf	kindly schedule an appointment at your convinience.	f	2026-08-26 08:16:22.924879
\.


--
-- Data for Name: mindfulness_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mindfulness_tracking (id, user_id, type, created_at, cycles_completed) FROM stdin;
1	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	body_scan	2026-08-05 12:44:23.48	0
2	718dc9fc-87e3-41f3-9e71-d90b46bf6f07	grounding	2026-08-05 12:44:50	0
4	44879cf7-dec1-4081-8de3-c5b64380bccf	guided_breathing	2026-08-13 14:44:26.154	14
5	44879cf7-dec1-4081-8de3-c5b64380bccf	guided_breathing	2026-08-13 19:27:09.342	2
6	44879cf7-dec1-4081-8de3-c5b64380bccf	guided_breathing	2026-08-18 09:09:40.021	1
7	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	guided_breathing	2026-08-18 13:53:39.493	3
8	601d5e03-a8f3-4997-b17f-fb07a003a915	guided_breathing	2026-08-19 08:03:28.8	1
9	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:52.249	6
10	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:54.647	6
11	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:56.395	6
12	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:56.941	6
13	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:58.165	6
14	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:58.715	6
15	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:59.112	6
16	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 19:00:00.049	6
17	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 19:00:00.246	6
18	cd54ed34-b109-43b1-99de-b3bf7c6b306f	guided_breathing	2026-08-20 18:59:58.479	6
19	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	guided_breathing	2026-08-26 04:11:34.801	2
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
633b669c-360c-4680-8ccd-f07be8934385	256789371638	602930	2026-08-18 11:37:14.556	2026-08-18 08:27:14.566448
dcb87bfc-1c26-4c7e-bc4f-2dc1ea305448	256727187780	686480	2026-08-18 17:48:36.27	2026-08-18 14:38:36.270897
a915740d-0cf0-40fe-926c-7e9b019763c1	256727187780	198459	2026-08-18 17:48:46.015	2026-08-18 14:38:46.015503
a39334ec-e623-4639-a8ac-3e9b274f2bbe	256727187780	580603	2026-08-18 17:48:48.608	2026-08-18 14:38:48.608969
708eff59-8503-46c4-bdc1-98cbbf25443c	256772028110	852834	2026-08-18 21:37:17.817	2026-08-18 18:27:17.828935
324c15a9-9061-4431-9e36-de3190aa22a1	256794319000	127896	2026-08-19 10:57:47.602	2026-08-19 07:47:47.612418
b11f137c-7a52-4ca4-b750-2cbf2488d52a	256780245680	171598	2026-08-20 10:43:11.466	2026-08-20 07:33:11.473917
0ed126a1-8d08-4a96-9e42-bde736cf7fe2	256780245680	130893	2026-08-20 10:45:16.291	2026-08-20 07:35:16.298149
e582ad9a-a652-42fe-91ae-ba9887a0d4c4	256760091780	538107	2026-08-22 13:40:00.059	2026-08-22 10:30:00.059809
7b1b0774-1ba0-4fac-937f-1caeabbc7091	256000000000	207249	2026-08-22 14:38:44.371	2026-08-22 11:28:44.378089
54a7f236-406b-4279-b4b0-d31f28164969	256744226804	812596	2026-08-23 17:41:20.982	2026-08-23 14:31:20.992859
35a21bcc-cd4b-4d8b-b924-3b383d608049	256787036602	462859	2026-08-23 17:43:26.048	2026-08-23 14:33:26.056593
cf523b6e-325e-4952-b0ca-ec6abce51c37	256780245680	293393	2026-08-26 10:27:41.888	2026-08-26 07:17:41.888819
db208b89-c55c-471c-9f59-f27ee9705ddb	256780245680	616683	2026-08-26 10:43:39.871	2026-08-26 07:33:39.872047
aa7772d2-383f-44dc-897a-93a060a1e92d	256703117731	642105	2026-08-26 10:48:19.48	2026-08-26 07:38:19.487706
d157c1da-e15c-400b-8d14-82cc0adf6ea6	256703408865	805245	2026-08-26 12:26:17.823	2026-08-26 09:16:17.831546
4abbc864-3b18-4d77-a2b3-d8bb8e1c43bd	256741066565	261374	2026-08-26 21:00:08.885	2026-08-26 17:50:08.887446
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

COPY public.profiles (id, user_id, first_name, last_name, dob, created_at, bio, occupation, profile_picture) FROM stdin;
b3eeb39c-3410-4e37-a419-2d653950dc49	7222b18b-22e4-44b7-8730-946d2173bab0	James Rogers	Nsereko	\N	2026-08-12 06:47:22.547996	\N	\N	\N
7f092e5b-d683-4ee3-8258-55a3d6e5cabb	b9900ca1-55f7-4138-948a-317ad41bcf0a	Caroline	Kisakye	\N	2026-08-12 06:47:22.550358	\N	\N	\N
5d925c31-51d8-4ef0-88e1-8f45760119c5	859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	Tina	Tusiime	\N	2026-08-12 06:47:22.55303	\N	\N	\N
f5648150-d931-47bb-85d8-571b2c79c658	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	Sulaiman	Kigozi	\N	2026-08-12 06:47:22.556759	\N	\N	\N
04efbda2-b290-47db-97fc-515d1246bc39	3e3c2134-26db-45b2-ada7-31c702970c7a	Alice	Katengeke	\N	2026-08-12 06:47:22.559096	\N	\N	\N
868500cd-0450-4ee2-baad-e90bec19f8ed	f05e0b82-6791-437d-8894-15076c6dd688	Muhanga	mpanja Christine	\N	2026-08-12 06:47:22.561093	\N	\N	\N
a8e31425-be80-4dd0-aa26-76ff18c80051	0776a746-8a6d-4a2b-a2d6-a664ad561f52	Samuel	Kimbowa	\N	2026-08-12 06:47:22.563387	\N	\N	\N
bf55081a-e914-495d-9539-39962ebf61cb	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	Amos	Farris	\N	2026-08-12 06:47:22.568798	\N	\N	\N
5cccc92a-4b99-4e9e-b909-977ae03edcf0	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	Mutebi	Taibu	\N	2026-08-18 13:34:54.561708	None than others	Nurse	\N
bb4b7d62-971c-4678-8f8c-a011c7c55e7d	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	Grace	Bikumbi	\N	2026-08-12 06:47:22.541424	\N	\N	\N
f3030bea-84b9-4ea1-9abd-94154d277b37	62b3a028-362b-4d90-b500-12bff5ab8c28	Ivan	Musenero	\N	2026-08-12 06:47:22.566546	\N	\N	\N
\.


--
-- Data for Name: screening_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.screening_results (id, patient_id, screening_type, score, answers, created_at) FROM stdin;
f6affd98-2445-4cbe-87a2-a258a2e84d7d	cd54ed34-b109-43b1-99de-b3bf7c6b306f	AGREEABLENESS	46	{"0": 5, "1": 2, "2": 5, "3": 4, "4": 2, "5": 5, "6": 2, "7": 5, "8": 1, "9": 5}	2026-08-17 15:38:45.387119
83200879-0190-4bec-88b7-f551470ae2a3	cd54ed34-b109-43b1-99de-b3bf7c6b306f	WHO5	24	{"0": 1, "1": 2, "2": 0, "3": 1, "4": 2}	2026-08-17 15:40:12.625474
3c160718-e229-4878-b834-be20ffc96bd2	cd54ed34-b109-43b1-99de-b3bf7c6b306f	GAD7	8	{"0": 1, "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 1}	2026-08-17 15:46:18.393208
898f6ed7-65b3-4df1-9807-84c099ad0cc0	44879cf7-dec1-4081-8de3-c5b64380bccf	GAD7	12	{"0": 0, "1": 1, "2": 2, "3": 3, "4": 2, "5": 2, "6": 2}	2026-08-18 09:11:20.366187
e681fd94-f228-4859-a590-4750636cf32c	601d5e03-a8f3-4997-b17f-fb07a003a915	AGREEABLENESS	43	{"0": 4, "1": 1, "2": 5, "3": 4, "4": 2, "5": 4, "6": 1, "7": 4, "8": 2, "9": 4}	2026-08-18 10:42:10.15
abefd445-e8cf-4207-8aef-f7cc8a5a0ee1	601d5e03-a8f3-4997-b17f-fb07a003a915	GAD7	2	{"0": 0, "1": 1, "2": 1, "3": 0, "4": 0, "5": 0, "6": 0}	2026-08-18 10:43:44.566811
0ec15bf7-071c-4f0b-a9e1-c6bf678544ac	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	AGREEABLENESS	37	{"0": 4, "1": 2, "2": 4, "3": 4, "4": 2, "5": 4, "6": 3, "7": 4, "8": 4, "9": 4}	2026-08-18 13:38:17.984953
2aed23b0-8cb4-4ba8-9257-4e4ea7468936	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	WHO5	48	{"0": 4, "1": 1, "2": 1, "3": 4, "4": 2}	2026-08-18 13:40:19.342333
fba5c1b9-1ee5-4c62-af66-e16664e23f6a	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	GAD7	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0}	2026-08-18 13:41:34.718336
7596ef1c-56fc-4da1-8aaa-36a642b010a8	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	PHQ9	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0}	2026-08-18 13:43:21.714832
40582d32-3049-4726-a2c5-45fa468e1aab	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	PHQ9	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0}	2026-08-18 13:44:17.98514
dd6bd7c5-5504-4f1c-8711-c92ddfcf3020	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	PCL5	2	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 1, "11": 1, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0}	2026-08-18 13:46:15.85209
772f21b0-fe14-4043-9e13-8d6c4943d320	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	NSSI	0	{"0": 0, "1": 0, "2": 0, "3": 0}	2026-08-18 13:47:11.398447
76a3849c-909a-48a8-a6e4-d7226a932209	0a810f98-59b4-4585-8e1e-8ef6bd25cc70	SUICIDE_RISK	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0}	2026-08-18 13:48:19.78894
5d130e4a-c236-4353-840c-b7c97e05916e	601d5e03-a8f3-4997-b17f-fb07a003a915	GAD7	6	{"0": 1, "1": 1, "2": 1, "3": 1, "4": 0, "5": 1, "6": 1}	2026-08-19 08:05:45.427046
113e069b-4299-43b6-bd77-35bc287d1346	601d5e03-a8f3-4997-b17f-fb07a003a915	WHO5	84	{"0": 4, "1": 4, "2": 4, "3": 4, "4": 5}	2026-08-19 08:07:13.223379
50add577-3137-42a8-9be4-4f501bced601	601d5e03-a8f3-4997-b17f-fb07a003a915	SUICIDE_RISK	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0}	2026-08-19 08:07:59.852222
4170b3fd-e77b-49cf-91f2-a1489ce33f67	a9979c97-7847-466d-a7dd-2a6757f78361	AGREEABLENESS	41	{"0": 5, "1": 1, "2": 5, "3": 5, "4": 2, "5": 5, "6": 5, "7": 5, "8": 5, "9": 5}	2026-08-20 07:44:59.476363
9cb95588-4533-436e-a715-303e19e587d4	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	WHO5	84	{"0": 5, "1": 4, "2": 4, "3": 3, "4": 5}	2026-08-26 03:12:38.649191
9749221d-891a-4abf-beff-a41698318bc9	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	AGREEABLENESS	47	{"0": 5, "1": 1, "2": 5, "3": 4, "4": 1, "5": 5, "6": 2, "7": 4, "8": 1, "9": 5}	2026-08-26 03:16:40.845821
d5cee116-1dd7-43fa-8a85-f1c048915d26	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	GAD7	3	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 3, "5": 0, "6": 0}	2026-08-26 03:21:21.516924
14378e1f-3a77-4116-b22e-ae407944bbab	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	PHQ9	9	{"0": 0, "1": 0, "2": 3, "3": 0, "4": 3, "5": 0, "6": 3, "7": 0, "8": 0}	2026-08-26 03:24:59.26979
2ee9825f-ddf9-4c19-80f9-f423826701fe	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	PHQ9	5	{"0": 0, "1": 0, "2": 2, "3": 0, "4": 3, "5": 0, "6": 0, "7": 0, "8": 0}	2026-08-26 03:48:04.126805
e7d94da0-cd51-4f4a-b697-eb80f491100a	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	PCL5	36	{"0": 2, "1": 2, "2": 0, "3": 0, "4": 3, "5": 3, "6": 3, "7": 0, "8": 0, "9": 4, "10": 3, "11": 1, "12": 4, "13": 0, "14": 1, "15": 3, "16": 3, "17": 0, "18": 0, "19": 4}	2026-08-26 04:06:14.259953
0c368b97-c232-44fc-9f3f-033c30154727	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	NSSI	4	{"0": 1, "1": 1, "2": 2, "3": 0}	2026-08-26 04:07:47.977252
0aec9ab9-6991-4b8a-93c3-da30509d663a	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	SUICIDE_RISK	2	{"0": 1, "1": 1, "2": 0, "3": 0, "4": 0}	2026-08-26 04:09:15.095246
8cedcdd1-ba9d-4554-9ba8-57720aae6c3b	f902f0a2-4c14-47e0-a048-9948ba23f1ff	AGREEABLENESS	38	{"0": 4, "1": 2, "2": 4, "3": 4, "4": 4, "5": 4, "6": 2, "7": 4, "8": 2, "9": 4}	2026-08-26 07:36:00.487966
3d0a9ec6-43f6-41bc-a7c8-e06927a61533	f902f0a2-4c14-47e0-a048-9948ba23f1ff	WHO5	76	{"0": 4, "1": 4, "2": 4, "3": 3, "4": 4}	2026-08-26 07:37:40.377286
51cf6cd0-2781-48e9-a115-f3beb34cff6a	f902f0a2-4c14-47e0-a048-9948ba23f1ff	GAD7	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0}	2026-08-26 07:38:56.693937
c3118ce8-26e2-4aaa-b844-0fd6cfb1c94f	f902f0a2-4c14-47e0-a048-9948ba23f1ff	SUICIDE_RISK	0	{"0": 0, "1": 0, "2": 0, "3": 0, "4": 0}	2026-08-26 07:39:48.158028
082ac056-cd04-4635-b4c2-2005a17b64bd	f902f0a2-4c14-47e0-a048-9948ba23f1ff	PHQ9	2	{"0": 0, "1": 0, "2": 1, "3": 1, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0}	2026-08-26 07:41:43.719712
\.


--
-- Data for Name: sleep_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sleep_tracking (id, user_id, score, created_at) FROM stdin;
1	44879cf7-dec1-4081-8de3-c5b64380bccf	60	2026-08-13 08:08:16.304
\.


--
-- Data for Name: stress_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stress_tracking (id, user_id, score, max_score, created_at) FROM stdin;
1	44879cf7-dec1-4081-8de3-c5b64380bccf	8	15	2026-08-13 01:48:47.728
2	44879cf7-dec1-4081-8de3-c5b64380bccf	5	15	2026-08-13 14:41:16.205
3	44879cf7-dec1-4081-8de3-c5b64380bccf	5	15	2026-08-13 14:41:17.472
4	44879cf7-dec1-4081-8de3-c5b64380bccf	5	15	2026-08-13 14:41:19.154
5	601d5e03-a8f3-4997-b17f-fb07a003a915	4	15	2026-08-19 08:01:41.155
6	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	3	15	2026-08-26 04:15:16.879
7	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	3	15	2026-08-26 04:15:27.483
\.


--
-- Data for Name: therapist_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.therapist_profiles (id, user_id, specialization, license_number, created_at, bio, profile_picture, hourly_rate, availability, title) FROM stdin;
880682d9-9716-4c6b-9593-699917e59fc6	7222b18b-22e4-44b7-8730-946d2173bab0	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.548829	\N	\N	\N	\N	\N
2cf6782c-d90b-4a92-9c6e-8b5f318e92db	b9900ca1-55f7-4138-948a-317ad41bcf0a	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.551301	\N	\N	\N	\N	\N
c86160ec-1002-457f-8345-18074c609a39	859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.553851	\N	\N	\N	\N	\N
da5138cb-505f-4da0-977b-3b74de85d3af	0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.557735	\N	\N	\N	\N	\N
4bb7e981-368b-4424-aa0e-d3ea78e20da6	3e3c2134-26db-45b2-ada7-31c702970c7a	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.559791	\N	\N	\N	\N	\N
4e3cdd9a-de57-48ff-a17e-78c683016b3f	f05e0b82-6791-437d-8894-15076c6dd688	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.561669	\N	\N	\N	\N	\N
d95e52e5-abe6-4e8b-ab8a-c186feaa5cab	0776a746-8a6d-4a2b-a2d6-a664ad561f52	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.564102	\N	\N	\N	\N	\N
b06864d1-5e41-4afc-8b2c-33ab5914a71d	cebc5a7c-85f5-4dfe-ae71-878f904c5b76	Governmet Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.569428	emergency response	\N	\N	\N	\N
29cf0345-1666-4aa6-9c1e-04d7a9e6b31f	b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	Clinical Psychologist /Addiction and mental health specialist 	State Registered Practitioner	2026-08-12 06:47:22.54541	Internationally certified \nAddiction Specialist \n Mental health Advocate \nTrauma and other mental health related disorders, Depression and Anxiety \nUTC- Global Master trainer , Member of International Society For Addiction professionals 	\N	\N	\N	
f7ffadec-e493-49d8-be96-bc214776f960	62b3a028-362b-4d90-b500-12bff5ab8c28	Government Mental Health Specialist	State Registered Practitioner	2026-08-12 06:47:22.567397	OCCUPATIONAL THERAPIST\nGambling addiction Specialist\nAddiction Professsional\n	\N	\N	\N	
\.


--
-- Data for Name: thought_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thought_records (id, user_id, situation, emotion, automatic_thought, rational_thought, created_at) FROM stdin;
1	44879cf7-dec1-4081-8de3-c5b64380bccf	drty	rty	rfth	rtyhj	2026-08-13 01:51:18.042
2	8bb05a99-bd5b-4607-b1ca-1d7d880048d1	Being Abandoned at hospital 	10	Sorrow, despair, and pain	To seek overstanding of the situation 	2026-08-26 04:25:47.617
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

COPY public.users (id, email, phone_number, role, password_hash, is_phone_verified, created_at, is_active, first_name, last_name, occupation, bio, profile_picture, date_of_birth, display_id) FROM stdin;
de9733ed-eadf-464c-8377-b4b2d6b7fcb5	kyakyo115@gmail.com	\N	admin	$2b$10$58k7yJ.FRio8WVmzbHfafO7vUmMHRPbSZXIzo61uBZs0dbwj.xLXq	f	2026-08-05 13:12:05.888691	t	\N	\N	\N	\N	\N	\N	MIQ4jl
1676e683-c4de-4e7a-b6c5-d42e5e0edb8e	stevkell12@gmail.com	\N	admin	$2b$10$58k7yJ.FRio8WVmzbHfafO7vUmMHRPbSZXIzo61uBZs0dbwj.xLXq	f	2026-08-05 13:12:05.888691	t	MAYANJA	STEVEN	INFORMATION TECHNOLOGIES 		\N	\N	xR1AR1
859d1c78-e1b0-4bb7-bf2c-89dc6e73cce5	tusiimetina@yahoo.com	+256000000004	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.55215	t	\N	\N	\N	\N	\N	\N	ESTVY6
3e3c2134-26db-45b2-ada7-31c702970c7a	alicekatss@gmail.com	+256000000006	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.558407	t	\N	\N	\N	\N	\N	\N	4RfSPT
f05e0b82-6791-437d-8894-15076c6dd688	mpanjatina@gmail.com	+256000000007	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56044	t	\N	\N	\N	\N	\N	\N	m73Kw1
b9900ca1-55f7-4138-948a-317ad41bcf0a	linaagain2002ii@gmail.com	256775525881	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.549645	t	\N	\N	\N	\N	\N	\N	R4v2P1
7222b18b-22e4-44b7-8730-946d2173bab0	nsereko66james@gmail.com	256772835958	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.546889	t	\N	\N	\N	\N	\N	\N	VKON89
0fef5fe9-bd3d-4235-904e-c85b0a24b2b1	kigozisulah@gmail.com	256777172572	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.554568	t	\N	\N	\N	\N	\N	\N	M5VYDe
0776a746-8a6d-4a2b-a2d6-a664ad561f52	kimbowas@gmail.com	256782777641	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56227	t	\N	\N	\N	\N	\N	\N	_PXI0J
44879cf7-dec1-4081-8de3-c5b64380bccf	\N	256742760000	patient	$2b$10$/ypulZFciFo3j5jT/AJKIO/QtRiSLYos4UOdNn90m9Z8Xx7KCNdv2	t	2026-08-12 08:00:33.480759	t	\N	\N	\N	\N	\N	2000-04-11	1049-0626
282d223e-2054-41d6-9878-3abf6468260e	\N	256704451131	patient	$2b$10$cZArxQjWJIIinXq33Gj.S.TkJw8uJ7aVlkpPk1KzhyMyrYzb.3Fea	t	2026-08-12 12:53:27.643791	t	\N	\N	\N	\N	\N	1992-08-12	1383-3422
cebc5a7c-85f5-4dfe-ae71-878f904c5b76	amosfarris@gmail.com	256782261312	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.568028	t	\N	\N	\N	\N	\N	\N	hLz0ty
718dc9fc-87e3-41f3-9e71-d90b46bf6f07	\N	256758767422	patient	$2b$10$iwGAEBvLZz.FUeHweNjkA.Lsj0UmP7tSk8nzXXI6TSbSJ0f8hrAjG	t	2026-08-05 11:51:15.189929	t	\N	\N	\N	\N	\N	1998-03-05	9943-5210
f807e2de-ba10-4928-af70-4b0648987846	semddylan@gmail.com	256777031798	patient	$2b$10$g1ZmfN7IrJP2CuirTpiLNeyyPhEtGmACIl66MPCNcL/abTQkbXAq2	t	2026-08-07 15:39:36.617308	t	Ssembatya	Dylan	mechanic	rjuyfjd uieddid diidkidkd	\N	2000-03-07	4258-8617
cd54ed34-b109-43b1-99de-b3bf7c6b306f	\N	256763612989	patient	$2b$10$tLANHDvujAH0rNMfb6SR2O.sNQBxq5OXgXgvY6tnLkIuNaTBy0bTK	t	2026-08-17 15:31:19.793995	t	\N	\N	\N	\N	\N	2000-01-23	3282-7530
1fc4a07d-22a7-42f8-8d19-be2a20992412	\N	256704896842	patient	$2b$10$AWkdiJHXkJ4lZTB9RgYfIOBvMrPhcw2/QGKOVIcGJys98J8LYuu9K	t	2026-08-18 08:12:32.449234	t	\N	\N	\N	\N	\N	1991-07-20	2136-9479
d9c9b025-8e58-4d62-915d-a09a70a5c611	\N	256751068004	patient	$2b$10$77RCsa8IIhZkYVmJJ67VIOW8R.vaYibOhsbIFIm3NKg5yKtMzf6k6	t	2026-08-18 08:23:51.032716	t	\N	\N	\N	\N	\N	2000-05-12	5597-9927
601d5e03-a8f3-4997-b17f-fb07a003a915	\N	256794319000	patient	$2b$10$LFaXQGhQRIVVSaSrf0OhH.lkSpLMJxudVzTno5pqaq4RIS.ipTaeq	t	2026-08-18 08:29:00.565385	t	\N	\N	\N	\N	\N	1993-06-08	1076-1922
bb9fbc74-bcb8-45a9-b01e-c9d94a190096	\N	256782656581	patient	$2b$10$xsiSLqvknd/urKYtjDBn3..I5FL2nX0NFEvb7TeOzPRkr6bXyHbTy	t	2026-08-18 08:56:12.755565	t	\N	\N	\N	\N	\N	1983-05-05	9101-3266
17fc9589-fadd-4d23-b5b3-2c0f967c7e2c	\N	256703351395	patient	$2b$10$1cW63gkULLuwPG99c7umou/lRHzbbRJxzOFYaKhSnvjARwnugzHni	t	2026-08-18 08:56:20.832023	t	\N	\N	\N	\N	\N	1992-12-03	5217-5243
aa1ba1e2-e311-403f-ba6c-def570f93211	\N	256795087882	patient	$2b$10$jgUl./Ep/u0YGRCfcBvp5e8R.tJi8gzscvYEu/AEZ1.P84t.6wTE.	t	2026-08-18 10:05:56.567401	t	\N	\N	\N	\N	\N	1988-05-29	8997-9507
0a810f98-59b4-4585-8e1e-8ef6bd25cc70	taibmutebi5@gmail.com	256703507428	patient	$2b$10$l1mJfiyOjWJPJd0O6MnMk.0d72k53ka0d1QlMkgUwvQlXcBckNjhi	t	2026-08-18 13:30:30.055386	t	\N	\N	\N	\N	\N	1998-05-25	8482-1099
402f15cd-bfd6-4ca4-85a9-87929754f1e0	\N	256789500310	patient	$2b$10$WqYAvnUiD9TeTzS8x/lo3.FSGIxIlZuLcM/Fxhms6QA5dE1uYPDi.	t	2026-08-18 14:07:54.898532	t	\N	\N	\N	\N	\N	2000-10-18	9596-0410
f0efea73-a97c-423c-bd05-aa38d49778e2	\N	256774030176	patient	$2b$10$stl8TQCEPJAm.KCtYUGGXOnBnj2EJ0FJbzKJASwUvNxQkKnig0V7i	t	2026-08-18 14:40:13.153506	t	\N	\N	\N	\N	\N	2005-08-02	5340-9382
b5a52fcd-c078-4ef7-92ae-61c3fd5726f7	gbikumbi@gmail.com	256774306896	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.537464	t	\N	\N	\N	\N	\N	\N	i5zlLR
ec2b7ea5-5340-4ded-9480-092b717942fc	\N	256774590774	patient	$2b$10$DKP0wcz9b.EDdEuP2rooQu7mB7FirGQTiVy5ciLW7MQpOo0DV9hs2	t	2026-08-19 06:28:24.701394	t	\N	\N	\N	\N	\N	2002-01-12	2686-6398
62b3a028-362b-4d90-b500-12bff5ab8c28	museneriio@gmail.com	256704793987	therapist	$2b$10$VGOu2Z4X0GNfAdsIVTMjseIoq0Bh/t3fz6CGB.IY6bFZoL/O.C9.K	f	2026-08-12 06:47:22.56572	t	\N	\N	\N	\N	\N	\N	jf2X9-
a2cd1799-8963-4d37-ae99-6b1acce73a50	\N	256760091780	patient	$2b$10$Lo4B4nrENAeroqkmg.kvvucvHRMtWk57O3ZmDbzpnf0fwGeQ8i2ou	t	2026-08-22 09:52:53.552433	t	\N	\N	\N	\N	\N	1999-06-15	8486-2504
7ca19ad6-8750-4172-a416-a6d47ad0a2da	\N	256754871801	patient	$2b$10$LvHas2ZGEaRXUz7Ib1LMo.Mag9FHRuvmXAlI.J867csCTP4S4vFAu	t	2026-08-22 11:29:33.232427	t	\N	\N	\N	\N	\N	1982-11-19	7733-7896
a676a0ed-ea40-42fe-9e4c-a3889e65518b	\N	256759844847	patient	$2b$10$VzTvg5mvQtjKUtx9H01vq.dwt0a6Poo5xcaXhX0.8fOSo7riKWxtu	t	2026-08-25 06:56:52.132234	t	\N	\N	\N	\N	\N	1999-07-26	7993-8696
8bb05a99-bd5b-4607-b1ca-1d7d880048d1	\N	256776111037	patient	$2b$10$Ef5yLYt8bMd6yl0cAlxUuO4ewFB6I0UdD3Hb7n8I/Eo/jNzgqyThu	t	2026-08-25 11:07:10.075207	t	\N	\N	\N	\N	\N	1967-08-05	9757-8383
b9badb8c-54fd-4d72-aec0-4f7b30cf4828	\N	256775153179	patient	$2b$10$uCrrKgQkPUtr3UwyCp7.hOyR7xvhKkO.kFFQ1SVFmQFh0COJlkAq6	t	2026-08-26 06:54:51.370881	t	\N	\N	\N	\N	\N	1990-08-10	1911-6563
f902f0a2-4c14-47e0-a048-9948ba23f1ff	\N	256778339344	patient	$2b$10$IYALUjiXrzhUHBorw5idLO4buEUDsiacIGMVegxRs2tc2NG.XVcBu	t	2026-08-26 07:33:32.296878	t	\N	\N	\N	\N	\N	1991-02-01	4124-5946
a9979c97-7847-466d-a7dd-2a6757f78361	\N	256703117731	patient	$2b$10$URohEMq021omhnqOVD67wueSahaiwNzAMbklLb8NZmgu6Xf/SWzw.	t	2026-08-20 07:41:28.970251	t	\N	\N	\N	\N	\N	2007-09-28	7381-0280
e3030b2e-cf60-426c-a450-88aa80c20f38	\N	256754725638	patient	$2b$10$C4uEp8NK6aM5WYG/bbaSduIUFoPrh18PdpJpvT2sGWaKG551JsNue	t	2026-08-26 08:10:03.554159	t	\N	\N	\N	\N	\N	1998-12-24	2547-1236
8b9a933b-daba-4b63-b737-c28c758f7be6	\N	256703408865	patient	$2b$10$zn31jB4IRr6KgT1sqU9pcOE.8fwWu3C2m6pqW0fh8MrhdarPcbSQm	t	2026-08-26 09:22:25.474091	t	\N	\N	\N	\N	\N	1983-06-06	9826-8863
a6c8ea21-56eb-451c-8f0d-e6b2d080b381	\N	256702693466	patient	$2b$10$amu6gjsqQnWDJaDBPrFPSO4wqbMOsI/6BPYjxuGXplYi7Z5Z0Ek6K	t	2026-08-26 10:28:08.69502	t	\N	\N	\N	\N	\N	1998-03-18	9341-7967
297cd794-4a52-4685-83e8-c7ae82f037f5	\N	256774276043	patient	$2b$10$gkbiv7/OwJvmfdsPZHlN/e3IfmFYiLVuFV2k40FdYdweIfwsO4WXK	t	2026-08-26 19:15:16.839792	t	\N	\N	\N	\N	\N	1986-07-08	8749-0630
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 31, true);


--
-- Name: mindfulness_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mindfulness_tracking_id_seq', 19, true);


--
-- Name: pre_approved_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pre_approved_admins_id_seq', 2, true);


--
-- Name: sleep_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sleep_tracking_id_seq', 1, true);


--
-- Name: stress_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stress_tracking_id_seq', 7, true);


--
-- Name: thought_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thought_records_id_seq', 2, true);


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
-- Name: users users_display_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_display_id_key UNIQUE (display_id);


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

\unrestrict tqhxONVBUG296ELpfRu9ZXWO1chzKbcRMosHnWB8hxx2CgK8LiQImADRnbq2lgr

