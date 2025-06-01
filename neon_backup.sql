--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date_applied date NOT NULL,
    company_name text NOT NULL,
    role_title text NOT NULL,
    role_url text,
    job_status text DEFAULT 'Applied'::text NOT NULL,
    application_stage text DEFAULT 'In Review'::text NOT NULL,
    resume_version text,
    mode_of_application text,
    follow_up_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.applications OWNER TO neondb_owner;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO neondb_owner;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    interview_id integer NOT NULL,
    score integer,
    difficulty_level text,
    what_went_well text,
    what_fell_short text,
    questions_asked text,
    your_questions text,
    follow_up_needed boolean DEFAULT false,
    time_to_next_round text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessments OWNER TO neondb_owner;

--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_id_seq OWNER TO neondb_owner;

--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    application_id integer NOT NULL,
    interview_stage text NOT NULL,
    interview_date timestamp without time zone,
    status text DEFAULT 'Scheduled'::text NOT NULL,
    prep_resources text,
    assigned_tasks text,
    feedback_notes text,
    interview_score integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.interviews OWNER TO neondb_owner;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO neondb_owner;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: preparation_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.preparation_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date date NOT NULL,
    topic text NOT NULL,
    resource_link text,
    confidence_score integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.preparation_sessions OWNER TO neondb_owner;

--
-- Name: preparation_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.preparation_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preparation_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: preparation_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.preparation_sessions_id_seq OWNED BY public.preparation_sessions.id;


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reminders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp without time zone NOT NULL,
    completed boolean DEFAULT false,
    related_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reminders OWNER TO neondb_owner;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminders_id_seq OWNER TO neondb_owner;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email text,
    is_admin boolean DEFAULT false NOT NULL,
    subscription_status text DEFAULT 'inactive'::text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: preparation_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.preparation_sessions ALTER COLUMN id SET DEFAULT nextval('public.preparation_sessions_id_seq'::regclass);


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.applications (id, user_id, date_applied, company_name, role_title, role_url, job_status, application_stage, resume_version, mode_of_application, follow_up_date, created_at, updated_at) FROM stdin;
6	1	2025-01-08	Wolt	Product Lead	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:36:56.65883	2025-05-26 06:49:33.214
41	1	2025-01-11	Meta	PM	\N	Rejected	Hiring Manager Round	B2C	Company Site	\N	2025-05-26 06:38:45.549404	2025-05-26 13:31:33.432
38	1	2025-01-28	DeliveryHero	Senior PM	\N	Rejected	Panel Interview	Custom	Company Site	\N	2025-05-26 06:38:45.328108	2025-05-26 13:31:55.099
36	1	2025-01-28	Medallia	Senior PM	\N	Rejected	HR Round	Platform	Company Site	\N	2025-05-26 06:38:45.180107	2025-05-26 06:49:34.291
4	1	2025-05-26	ServiceNow	Staff Product Manager	\N	Applied	In Review	\N	Recruiter	\N	2025-05-26 06:31:42.533316	2025-05-26 13:53:05.335
60	1	2025-03-06	Trivago	Sr PM	\N	Applied	Technical Round	Custom	Company Site	\N	2025-05-26 06:38:46.943436	2025-05-26 06:49:35.045
7	1	2025-01-08	NewRelic	Sr PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:42.952093	2025-05-26 06:49:33.338
8	1	2025-01-08	Cloudera	Sr PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:43.101961	2025-05-26 06:49:33.372
9	1	2025-01-08	TaylorWessing	AI PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:43.175352	2025-05-26 06:49:33.404
10	1	2025-01-08	Primark	Platform PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:43.249968	2025-05-26 06:49:33.439
11	1	2025-01-09	Arm	Platform PM - AI/ML	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:43.326484	2025-05-26 06:49:33.475
102	1	2025-05-10	Uber	Senior Product Manager	\N	Rejected	No Callback	Custom	Company Site	\N	2025-05-26 06:38:50.054301	2025-05-26 15:41:22.068
12	1	2025-01-09	Walmart	Staff PM	\N	Rejected	No Callback	B2C	Company Site	\N	2025-05-26 06:38:43.400289	2025-05-26 15:45:24.794
64	1	2025-03-15	Wise	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.23715	2025-05-26 06:49:35.183
63	1	2025-03-15	HelloFresh	Sr PM	\N	Rejected	HR Round	Custom	Company Site	\N	2025-05-26 06:38:47.16183	2025-05-26 06:49:35.149
67	1	2025-03-16	Salesforce	Senior PM	\N	Rejected	Hiring Manager Round	Custom	Company Site	\N	2025-05-26 06:38:47.459086	2025-05-26 13:32:10.41
87	1	2025-05-01	Delivery Hero	Sr PM	\N	Rejected	Panel Interview	Custom	Company Site	\N	2025-05-26 06:38:48.926802	2025-05-26 14:09:43.329
112	1	2025-05-25	Intuit	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.811916	2025-05-26 14:00:13.389
108	1	2025-05-16	Intuit	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.49782	2025-05-26 14:38:02.211
106	1	2025-05-16	Atlassian	Senior Product Manager	\N	Rejected	No Callback	Custom	Company Site	\N	2025-05-26 06:38:50.3514	2025-05-26 14:38:11.076
13	1	2025-01-09	Paypal	Sr PM	\N	Rejected	In Review	Platform	Company Site	\N	2025-05-26 06:38:43.473875	2025-05-26 06:49:33.541
14	1	2025-01-12	Tealium	Sr PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:43.552907	2025-05-26 06:49:33.572
111	1	2025-05-25	Wayfair	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.73703	2025-05-26 14:00:57.165
110	1	2025-05-25	Miro	Product Manager	\N	Applied	HR Round	Custom	Company Site	\N	2025-05-26 06:38:50.664122	2025-05-26 11:28:33.638
109	1	2025-05-25	Lloyds Bank	Senior Product Owner	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.575677	2025-05-26 13:31:12.986
113	1	2025-05-25	Target	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.884635	2025-05-26 14:01:02.423
65	1	2025-03-16	Walmart	Staff PM	\N	Applied	In Review	Standard	Company Site	\N	2025-05-26 06:38:47.309476	2025-05-26 06:49:35.215
116	1	2025-05-26	Agoda	Senior Product Manager	\N	Applied	In Review	B2C	Recruiter	\N	2025-05-26 13:52:05.986037	2025-05-26 13:59:48.673
114	1	2025-05-25	Microsoft	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.957072	2025-05-26 14:00:03.146
15	1	2025-01-12	OakNorth	Technical PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:43.629215	2025-05-26 06:49:33.605
16	1	2025-01-12	Expedia	Sr PM	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:43.70339	2025-05-26 06:49:33.636
17	1	2025-01-15	Oracle	Principal PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:43.778626	2025-05-26 06:49:33.679
18	1	2025-01-15	Adobe	Sr PM	\N	Applied	In Review	B2B	Company Site	\N	2025-05-26 06:38:43.852513	2025-05-26 06:49:33.711
19	1	2025-01-15	Epicor	PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:43.926456	2025-05-26 06:49:33.742
66	1	2025-03-16	Zalando	Principal PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.386624	2025-05-26 06:49:35.246
20	1	2025-01-15	Atlassian	Principal PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:43.999506	2025-05-26 06:49:33.776
21	1	2025-01-15	Walmart	Staff PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:44.071423	2025-05-26 06:49:33.808
22	1	2025-01-16	Elastic	Sr PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:44.145427	2025-05-26 06:49:33.841
23	1	2025-01-17	Dynatrace	Principal PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:44.218224	2025-05-26 06:49:33.873
24	1	2025-01-18	Stackoverflow	Sr PM	\N	Rejected	In Review	AI/ML Custom	Company Site	\N	2025-05-26 06:38:44.291682	2025-05-26 06:49:33.906
25	1	2025-01-18	Adobe	Sr PM	\N	Rejected	In Review	AI/ML Custom	Company Site	\N	2025-05-26 06:38:44.364868	2025-05-26 06:49:33.937
26	1	2025-01-20	Paypal	Lead PM	\N	Rejected	In Review	Lead PM	Company Site	\N	2025-05-26 06:38:44.438205	2025-05-26 06:49:33.968
27	1	2025-01-20	Freetrade	Senior PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:44.513464	2025-05-26 06:49:33.998
28	1	2025-01-20	JPMC	PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:44.587289	2025-05-26 06:49:34.029
29	1	2025-01-23	Paypal	Senior PM	\N	Rejected	In Review	Platform	Company Site	\N	2025-05-26 06:38:44.660888	2025-05-26 06:49:34.061
30	1	2025-01-24	Zalando	Senior PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:44.734186	2025-05-26 06:49:34.093
31	1	2025-01-24	Preply	Senior PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:44.808757	2025-05-26 06:49:34.13
32	1	2025-01-24	Microsoft	Senior PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:44.882175	2025-05-26 06:49:34.162
33	1	2025-01-24	Bloomberg	PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:44.962517	2025-05-26 06:49:34.199
34	1	2025-01-28	Dremio	Senior PM	\N	Rejected	In Review	Cloud Infra	Company Site	\N	2025-05-26 06:38:45.034428	2025-05-26 06:49:34.23
35	1	2025-01-28	Tripadvisor	Senior PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:45.106308	2025-05-26 06:49:34.261
37	1	2025-01-28	Playolocity	Senior PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:45.253776	2025-05-26 06:49:34.324
39	1	2025-01-31	Wise	Principal PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:45.401564	2025-05-26 06:49:34.387
40	1	2025-02-03	Lloyds Bank	Cloud PO	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:45.475665	2025-05-26 06:49:34.418
42	1	2025-02-06	JPMC	PM	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:45.62223	2025-05-26 06:49:34.481
43	1	2025-02-05	JPMC	PM	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:45.694822	2025-05-26 06:49:34.512
44	1	2025-02-12	Spotify	PM	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:45.768014	2025-05-26 06:49:34.543
45	1	2025-02-14	Confluence	Product Owner	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:45.839982	2025-05-26 06:49:34.574
46	1	2025-02-14	Datasnipper	Senior PM	\N	Rejected	In Review	Platform	Company Site	\N	2025-05-26 06:38:45.914924	2025-05-26 06:49:34.606
47	1	2025-02-19	Amazon	PM Fresh	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:45.989354	2025-05-26 06:49:34.635
48	1	2025-02-19	Amazon	PM Insurance	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:46.062156	2025-05-26 06:49:34.666
49	1	2025-02-19	Walmart	Staff PM	\N	Rejected	In Review	Platform	Company Site	\N	2025-05-26 06:38:46.135673	2025-05-26 06:49:34.697
50	1	2025-02-20	Just Eat	Senior Technical PM	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:46.208126	2025-05-26 06:49:34.729
51	1	2025-02-25	Adobe	Product Manager	\N	Applied	In Review	B2C	Company Site	\N	2025-05-26 06:38:46.286317	2025-05-26 06:49:34.761
52	1	2025-03-03	JetBrains	Sr PM	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:46.359799	2025-05-26 06:49:34.793
53	1	2025-03-03	N26	PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:46.431972	2025-05-26 06:49:34.827
54	1	2025-03-03	Get Your Guide	Sr PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:46.504076	2025-05-26 06:49:34.858
55	1	2025-03-03	Bolt	Sr PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:46.577797	2025-05-26 06:49:34.889
56	1	2025-03-04	Intuit	Sr PM	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:46.652358	2025-05-26 06:49:34.92
57	1	2025-03-06	Barclays	Product Owner	\N	Rejected	In Review	Platform Engineering	Company Site	\N	2025-05-26 06:38:46.725475	2025-05-26 06:49:34.952
58	1	2025-03-06	Tesco	Sr PM	\N	Rejected	In Review	Cloud Infra	Company Site	\N	2025-05-26 06:38:46.798798	2025-05-26 06:49:34.982
59	1	2025-03-06	ServiceNow	Sr Principal PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:46.870261	2025-05-26 06:49:35.014
61	1	2025-03-06	Walmart	Sr PM	\N	Applied	In Review	Standard	Company Site	\N	2025-05-26 06:38:47.016549	2025-05-26 06:49:35.075
62	1	2025-03-15	Agoda	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.089246	2025-05-26 06:49:35.118
68	1	2025-03-24	JetBrains	PM	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:47.53259	2025-05-26 06:49:35.308
69	1	2025-03-24	Wise	PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:47.605605	2025-05-26 06:49:35.339
70	1	2025-03-24	Wayfair	PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:47.678303	2025-05-26 06:49:35.372
71	1	2025-03-25	N26	PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.751264	2025-05-26 06:49:35.405
72	1	2025-04-01	Atlassian	Sr PM	\N	Rejected	In Review	Platform	Company Site	\N	2025-05-26 06:38:47.825095	2025-05-26 06:49:35.434
73	1	2025-04-12	Wolt	Product Lead	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.898155	2025-05-26 06:49:35.464
74	1	2025-04-14	Babbel	Senior PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:47.970874	2025-05-26 06:49:35.494
75	1	2025-04-14	DeepL	Staff PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.043329	2025-05-26 06:49:35.525
76	1	2025-04-15	Make	AI PM	\N	Rejected	In Review	AI/ML	Company Site	\N	2025-05-26 06:38:48.120768	2025-05-26 06:49:35.556
77	1	2025-04-16	Trustpilot	Sr PM	\N	Rejected	In Review	B2C	Company Site	\N	2025-05-26 06:38:48.191572	2025-05-26 06:49:35.589
78	1	2025-04-17	Dropbox	PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.273095	2025-05-26 06:49:35.623
79	1	2025-04-17	Adobe	Senior PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.345022	2025-05-26 06:49:35.654
80	1	2025-04-17	Adobe	Senior PM	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.417563	2025-05-26 06:49:35.687
81	1	2025-04-17	eBay	Senior PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.489825	2025-05-26 06:49:35.729
84	1	2025-04-22	Siemens	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.708048	2025-05-26 06:49:35.824
86	1	2025-05-01	Target	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.854154	2025-05-26 06:49:35.89
89	1	2025-05-06	Target	PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.094724	2025-05-26 06:49:35.98
90	1	2025-05-07	Redhat	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.167371	2025-05-26 06:49:36.012
91	1	2025-05-07	NewRelic	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.245014	2025-05-26 06:49:36.043
93	1	2025-05-07	Confluence	Principal PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.396937	2025-05-26 06:49:36.11
94	1	2025-05-07	NetApp	PM	\N	Rejected	In Review	Standard	Company Site	\N	2025-05-26 06:38:49.47055	2025-05-26 06:49:36.144
95	1	2025-05-08	Microsoft	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.543568	2025-05-26 06:49:36.175
96	1	2025-05-09	Bolt	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.616753	2025-05-26 06:49:36.205
99	1	2025-05-09	Viator	Sr PM	\N	Rejected	In Review	B2B	Company Site	\N	2025-05-26 06:38:49.835274	2025-05-26 06:49:36.297
100	1	2025-05-09	Instapro	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.909001	2025-05-26 06:49:36.328
83	1	2025-04-22	JetBrains	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.63478	2025-05-26 14:01:23.347
98	1	2025-05-09	Deel	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.762524	2025-05-26 10:27:36.568
103	1	2025-05-10	Salesforce	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.126973	2025-05-26 06:49:36.42
104	1	2025-05-11	Wise	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.201076	2025-05-26 06:49:36.451
82	1	2025-04-17	DeliveryHero	Sr PM	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.56138	2025-05-26 13:37:01.121
88	1	2025-05-02	Taxfix	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.021623	2025-05-26 14:01:28.085
92	1	2025-05-07	Bluecore	Senior Product Manager	\N	Rejected	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.318447	2025-05-26 14:01:43.821
105	1	2025-05-16	Microsoft	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.278498	2025-05-26 10:22:02.896
107	1	2025-05-16	PayU	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:50.424388	2025-05-26 10:22:19.547
85	1	2025-04-22	Intuit	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:48.780932	2025-05-26 14:37:24.697
101	1	2025-05-09	Datadog	Senior Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.981767	2025-05-26 10:27:18.129
97	1	2025-05-09	Arm	Product Manager	\N	Applied	In Review	Custom	Company Site	\N	2025-05-26 06:38:49.689984	2025-05-26 15:40:57.141
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assessments (id, user_id, interview_id, score, difficulty_level, what_went_well, what_fell_short, questions_asked, your_questions, follow_up_needed, time_to_next_round, created_at) FROM stdin;
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.interviews (id, user_id, application_id, interview_stage, interview_date, status, prep_resources, assigned_tasks, feedback_notes, interview_score, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: preparation_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.preparation_sessions (id, user_id, date, topic, resource_link, confidence_score, notes, created_at) FROM stdin;
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reminders (id, user_id, type, title, description, due_date, completed, related_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, name, role, created_at, email, is_admin, subscription_status) FROM stdin;
1	demo	demo	Demo User	Product Manager	2025-05-26 06:26:57.346862	\N	f	inactive
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.applications_id_seq', 116, true);


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.assessments_id_seq', 1, false);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- Name: preparation_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.preparation_sessions_id_seq', 1, false);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: preparation_sessions preparation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.preparation_sessions
    ADD CONSTRAINT preparation_sessions_pkey PRIMARY KEY (id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_applications_composite; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_applications_composite ON public.applications USING btree (user_id, job_status, date_applied DESC);


--
-- Name: idx_applications_date_applied; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_applications_date_applied ON public.applications USING btree (date_applied DESC);


--
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_applications_status ON public.applications USING btree (job_status);


--
-- Name: idx_applications_user_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_applications_user_date ON public.applications USING btree (user_id, date_applied DESC);


--
-- Name: idx_applications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_applications_user_id ON public.applications USING btree (user_id);


--
-- Name: idx_assessments_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_assessments_user_id ON public.assessments USING btree (user_id);


--
-- Name: idx_interviews_application_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_interviews_application_id ON public.interviews USING btree (application_id);


--
-- Name: idx_interviews_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_interviews_user_id ON public.interviews USING btree (user_id);


--
-- Name: idx_preparation_sessions_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_preparation_sessions_date ON public.preparation_sessions USING btree (date DESC);


--
-- Name: idx_preparation_sessions_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_preparation_sessions_user_id ON public.preparation_sessions USING btree (user_id);


--
-- Name: idx_reminders_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reminders_user_id ON public.reminders USING btree (user_id);


--
-- Name: applications applications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assessments assessments_interview_id_interviews_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_interview_id_interviews_id_fk FOREIGN KEY (interview_id) REFERENCES public.interviews(id);


--
-- Name: assessments assessments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: interviews interviews_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id);


--
-- Name: interviews interviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: preparation_sessions preparation_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.preparation_sessions
    ADD CONSTRAINT preparation_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reminders reminders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


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

