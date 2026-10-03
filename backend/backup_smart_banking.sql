--
-- PostgreSQL database dump
--

\restrict ZhG9LCIkyPADNd6AD5d6AZYyITJDkBldfZLydcTtYcwAEeblLMacdz3BTHEbgAf

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'WAITING',
    'SERVING',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'customer',
    'employee',
    'admin'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "openingHours" text DEFAULT '8:00 AM - 5:00 PM'::text NOT NULL,
    "isOpen" boolean DEFAULT true NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ForexAlert; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ForexAlert" (
    id text NOT NULL,
    "currencyCode" text NOT NULL,
    "targetRate" numeric(10,4) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ForexRate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ForexRate" (
    id text NOT NULL,
    "currencyCode" text NOT NULL,
    "currencyName" text NOT NULL,
    "flagEmoji" text NOT NULL,
    "cashBuy" numeric(10,4) NOT NULL,
    "cashSell" numeric(10,4) NOT NULL,
    "ttBuy" numeric(10,4) NOT NULL,
    "ttSell" numeric(10,4) NOT NULL,
    change24h text NOT NULL,
    "isPositive" boolean DEFAULT true NOT NULL,
    "isMajor" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: QueueTicket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QueueTicket" (
    id text NOT NULL,
    "ticketNumber" text NOT NULL,
    status public."TicketStatus" DEFAULT 'WAITING'::public."TicketStatus" NOT NULL,
    "estimatedWaitMins" integer DEFAULT 10 NOT NULL,
    "userId" text NOT NULL,
    "branchId" text NOT NULL,
    "serviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isArchivedByEmployee" boolean DEFAULT false NOT NULL,
    "servedByUserId" text
);


--
-- Name: Service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "clerkUserId" text NOT NULL,
    email text,
    phone text,
    role public."UserRole" DEFAULT 'customer'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "firstName" text,
    "lastName" text
);


--
-- Name: _BranchToService; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_BranchToService" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Branch" (id, name, address, latitude, longitude, "openingHours", "isOpen", phone, "createdAt", "updatedAt") FROM stdin;
da41d799-753c-4dc7-8cbd-50fa4f941af0	Wegagen Bank, Beshale Branch	Salitemihret, Bole, Addis Ababa, Ethiopia	9.0116292	38.8353351	Mon-Fri 8:00 AM - 6:00 PM, Sat 8:00 AM - 5:00 PM, Sun Closed	t	+251 11 667 7688	2026-08-22 00:31:16.585	2026-08-22 00:31:16.585
dd92d2b6-4392-491a-bb87-ddc9c679fb05	Wegagen Bank HQ	Stadium, Meskel Square, Addis Ababa 1018, Ethiopia	9.0118121	38.7560476	Mon-Sat 8:00 AM - 6:00 PM, Sun Closed	t	+251 11 552 3800	2026-08-22 00:31:16.585	2026-08-22 00:31:16.585
8d715c71-8e14-4b96-9c67-d3bceee52c23	Wegagen - 4 Kilo Branch	4 Kilo, Addis Ababa	9.037	38.761	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 1400	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
fedbeda3-3992-41c9-87bd-4789314747db	Wegagen - Addis Ketema Branch	Addis Ketema, Addis Ababa	9.042	38.743	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
06bb35e2-61f8-4037-8cfb-478843a141a4	Wegagen - Arada Branch	Arada, Addis Ababa	9.038	38.755	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
94c42d9d-9ea6-4942-b393-3c004594d94e	Wegagen - Bambis Area Branch	Bambis, Addis Ababa	9.01	38.77	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
25371cad-05f0-43f8-a20e-471c254e71f9	Wegagen - Cathedral Area Branch	Cathedral Area, Addis Ababa	9.034	38.751	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
c447516f-9551-4b62-91c4-ea04a727e9dd	Wegagen - CMC Michael Branch	CMC Michael, Addis Ababa	9.038	38.844	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
68fc4825-c207-4ae0-9f82-06786e57e7e4	Wegagen - Enkulal Fabrika Branch	Enkulal Fabrika, Addis Ababa	9.03	38.746	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 7355	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
455ce764-1546-416a-9526-5d6d77e732f2	Wegagen - Eri Bekentu Branch	Eri Bekentu, Addis Ababa	9.028	38.748	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 3861	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
4afae4c0-5c85-40ec-b58c-16e26126e864	Wegagen - Gullele Branch	Gullele, Addis Ababa	9.065	38.738	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 273 2016	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
72eca6d9-4c96-47e2-a1a0-9aae91d69c36	Wegagen - Jan Meda Branch	Jan Meda, Addis Ababa	9.047	38.766	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 1400	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
8c04efcd-ea6b-47bf-900c-431564333840	Wegagen - Kebena Branch	Kebena, Addis Ababa	9.03	38.785	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 1094	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
1633fb2b-b892-457c-b57d-0bde5812db9d	Wegagen - Kechene Branch	Kechene, Addis Ababa	9.045	38.74	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 126 3139	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
f0483d05-e189-4219-a2d9-a243cf711994	Wegagen - Kidist Mariam Branch	Kidist Mariam, Addis Ababa	9.024	38.74	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 157 0033	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
e4711a1e-a4c7-40ff-a751-0f40ac82e0c5	Wegagen - Kotebe Branch	Kotebe, Addis Ababa	9.06	38.82	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 666 3730	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
bd355b5b-611e-45af-a094-1ea5eabb3051	Wegagen - Lamberet Branch	Lamberet, Addis Ababa	9.055	38.8	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 667 6289	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
643829c7-4c18-4d72-a56f-9e47bba4b7ef	Wegagen - Lamberet Menaheria Branch	Lamberet Menaheria, Addis Ababa	9.056	38.801	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 666 0853	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
3763d411-c3bb-4eef-9fd1-35fbe26e540e	Wegagen - Mesfin Harar Avenue Branch	Mesfin Harar Avenue, Addis Ababa	9.018	38.8	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 171 2033	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
69dfde25-b4b2-45bd-876f-3f336bfbb7fc	Wegagen - Nigist Zewditu Street Branch	Nigist Zewditu Street, Addis Ababa	9.015	38.77	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 557 8071	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
7660719d-522f-4b15-bacd-64bea624bb07	Wegagen - Sebara Babur Branch	Sebara Babur, Addis Ababa	9	38.77	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 157 0329	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
765b0d7d-22a9-457c-852e-b55d03363843	Wegagen - Shola Branch	Shola Market, Addis Ababa	9.027	38.8	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 659 1822	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
650f6613-1133-4fa1-9398-4b47c900239b	Wegagen - Wosen Branch	Wosen, Addis Ababa	9.05	38.78	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 667 8951	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
ce82a0af-64f4-43f9-bb6e-1c01d59ff875	Wegagen - Wuhalimat Branch	Wuhalimat, Addis Ababa	9.015	38.755	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 663 1518	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
257ca620-5297-4057-93c1-828f83c9aeec	Wegagen - Yeka Abado Branch	Yeka Abado, Addis Ababa	9.075	38.83	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 893 1029	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
c6514258-c87d-4697-8a48-a08a880a70c2	Wegagen - Summit Branch	Summit, Addis Ababa	8.98	38.85	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
f0a35c14-2cbd-487e-aeb9-26493f3e52dd	Wegagen - Shala Menafesha Branch	Djibouti Street, Addis Ababa	9.01	38.775	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 552 3520	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
8a80f72b-90fc-426f-9efd-d91a1800e89d	Wegagen - Lideta Area Branch	Lideta, Addis Ababa	9.01	38.742	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 552 0961	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
dc9de757-3c31-4e0d-a067-8dd85dacbeaf	Wegagen - Radisson Branch	Near Radisson Blu, Addis Ababa	9.012	38.77	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
862f6b01-3cac-4402-ba40-e7130cdfca9a	Wegagen - Mesalemiya Branch	Malawi Street, Addis Ababa	9.042	38.748	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
796d2ee9-a2c2-4628-add7-5095168bc702	Wegagen - Atena Tera Branch	Atena Tera, Addis Ababa	9.03	38.745	Mon-Fri: 8:00 AM - 5:00 PM	t	+251 11 000 0000	2026-08-22 20:43:38.913	2026-08-22 20:43:38.913
5874536a-5846-415c-9eff-0e26e173a1d9	Wegagen - Kazanchis Branch	Africa Avenue, Near UNECA Building	9.0175	38.7725	8:00 AM - 5:00 PM	t	+251 11 551 6789	2026-08-18 08:31:39.712	2026-08-31 10:39:57.95
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	Wegagen - Merkato Branch	Somale Tera, Near Grand Anwar Mosque	9.032	38.739	8:00 AM - 5:00 PM	t	+251 11 278 4400	2026-08-31 10:39:57.962	2026-08-31 10:39:57.962
8bc84e96-c28e-4181-81ac-e6011ffc92e8	Wegagen - Mexico Branch	Ras Abebe Aregay St, Mexico Square	9.0112	38.7467	8:00 AM - 5:00 PM	t	+251 11 553 9876	2026-08-18 08:31:39.762	2026-08-31 10:39:57.987
35fdc856-f6f5-4da0-9b09-148c040c2406	Wegagen - Sarbet Branch	Near African Union HQ, Sarbet	8.9987	38.7364	8:00 AM - 5:00 PM	f	+251 11 372 1122	2026-08-18 08:31:39.773	2026-08-31 10:39:58.007
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	Wegagen - Headquarters (HQ) Branch	Ras Mekonnen Avenue, Legehar / Stadium	9.0145	38.7538	8:00 AM - 5:00 PM	t	+251 11 552 3800	2026-08-31 10:39:57.913	2026-08-31 10:39:57.913
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	Wegagen - Bole Branch	Bole Road, Near Friendship City Center	8.9954	38.7852	8:00 AM - 5:00 PM	t	+251 11 661 2345	2026-08-18 08:31:39.673	2026-08-31 10:39:57.936
7f52270d-3d26-4c25-b913-b522a9ce7665	Wegagen - Piassa Branch	Churchill Avenue, Near Eliana Hotel	9.0348	38.7525	8:00 AM - 5:00 PM	t	+251 11 155 4321	2026-08-18 08:31:39.748	2026-08-31 10:39:57.98
8828c6ac-6e64-4b47-ad22-4b732108c5da	Wegagen - Megenagna Branch	Sileshi Sihine Building, Megenagna Square	9.021	38.802	8:00 AM - 5:00 PM	t	+251 11 663 8811	2026-08-22 20:43:38.913	2026-08-31 10:39:57.97
e8964f0c-6103-4650-8c8d-8d1c34c5d755	Wegagen - Arat Kilo Branch	Near Ministry of Education, Arat Kilo	9.033	38.761	8:00 AM - 5:00 PM	t	+251 11 123 7799	2026-08-31 10:39:57.996	2026-08-31 10:39:57.996
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	Wegagen - CMC Branch	CMC Road, Near Michael Square	9.022	38.835	8:00 AM - 5:00 PM	t	+251 11 647 3344	2026-08-31 10:39:58.001	2026-08-31 10:39:58.001
\.


--
-- Data for Name: ForexAlert; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ForexAlert" (id, "currencyCode", "targetRate", "isActive", "userId", "createdAt") FROM stdin;
faa76129-a9f7-494d-8b72-11950e07a65b	USD	127.5000	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-20 07:46:15.141
\.


--
-- Data for Name: ForexRate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ForexRate" (id, "currencyCode", "currencyName", "flagEmoji", "cashBuy", "cashSell", "ttBuy", "ttSell", change24h, "isPositive", "isMajor", "updatedAt") FROM stdin;
3bef1a4e-eeae-4884-9153-7429b7e90492	EUR	Euro	🇪🇺	136.1000	138.8000	137.0500	139.7500	-0.12%	f	t	2026-08-31 10:39:58.03
c0da9e73-c955-4f5e-a60e-a87adf86d072	GBP	British Pound	🇬🇧	160.2500	163.4500	161.4000	164.6000	+0.48%	t	t	2026-08-31 10:39:58.033
3da85df3-d176-4e83-97ad-172dc4acd458	AED	UAE Dirham	🇦🇪	34.1400	34.8200	34.3500	35.0300	+0.05%	t	t	2026-08-31 10:39:58.036
05392bea-ae46-4ba7-8fdd-6467433019f8	SAR	Saudi Riyal	🇸🇦	33.4200	34.0800	33.6000	34.2700	-0.08%	f	t	2026-08-31 10:39:58.039
474b393e-3262-40c7-be4c-aa08c97d1ac7	CAD	Canadian Dollar	🇨🇦	91.2000	93.0000	91.8000	93.6000	+0.18%	t	f	2026-08-31 10:39:58.043
5278a8cf-348d-4dbf-be9a-a0b505ed27cf	CNY	Chinese Yuan	🇨🇳	17.3000	17.6500	17.4500	17.8000	-0.04%	f	f	2026-08-31 10:39:58.046
4e73f484-724f-41cb-b97e-87bdd2e0ddb5	CHF	Swiss Franc	🇨🇭	141.5000	144.3000	142.3000	145.1000	+0.22%	t	f	2026-08-31 10:39:58.06
dc655db6-b711-4d43-9699-db6824911117	USD	US Dollar	🇺🇸	125.4000	127.9000	126.1500	128.6700	+0.35%	t	t	2026-09-01 21:59:32.276
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, title, message, "isRead", "userId", "createdAt") FROM stdin;
f03ec612-b4a4-4483-92e7-3d6292d6a9bc	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	f	f963d587-36f3-41be-8f5a-db397dd3f4eb	2026-08-27 08:38:45.92
6d44b82b-d6de-4fe8-b616-03e968373f04	Queue Ticket Booked (A002) 🎫	Your ticket A002 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	f	f963d587-36f3-41be-8f5a-db397dd3f4eb	2026-08-27 08:40:28.192
e030607d-ce88-40c4-805e-a417bf330a5c	Now Serving: Ticket M003 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for ATM Card Request.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 10:25:42.757
2e9843ed-2830-4794-b47c-1db7fe9364a2	Now Serving: Ticket M004 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for ATM Card Request.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 10:48:48.515
a005cd4d-8322-414f-9cda-2d20bc7a77cd	Queue Ticket Booked (M004) 🎫	Your ticket M004 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 10:40:59.925
c875604d-d10e-433b-a567-c84d5ef6c6cf	Service Completed Successfully ✅	Your requested service (ATM Card Request) at Wegagen - 4 Kilo Branch has been completed. Thank you for banking with Wegagen Bank!	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 10:31:06.307
4c8c5126-ef5e-4f13-8866-911aea1d51f2	Queue Ticket Booked (M003) 🎫	Your ticket M003 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 10:22:19.821
e242c6d2-f109-4726-95e6-9c400826fe5d	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Teller Services at Wegagen - Addis Ketema Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-24 08:29:31.682
9a1f6749-5e78-42d5-9a6a-7adf7c55219b	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-24 12:03:18.725
d80f38d0-6ef2-4378-a37e-7d1236d1f3a0	Now Serving: Ticket M001 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for ATM Card Request.	t	aed86231-957c-4ccf-968f-e704c8216b52	2026-08-27 10:19:14.903
ce9e6fe6-2f75-4714-a889-7087a6c65363	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-26 08:38:54.65
bc251f5b-5273-4f57-82f4-c1e2196c7407	Queue Ticket Booked (A002) 🎫	Your ticket A002 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-26 11:39:31.859
fb87a550-fb4d-4e19-96a2-bed73c96cbe1	Now Serving: Ticket A002 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for Teller Services.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-26 11:40:52.053
d3e9980e-6c65-40d7-a4d0-c713233239bc	Queue Ticket Booked (M002) 🎫	Your ticket M002 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-27 10:21:12.087
cb2c64c1-0014-4539-882c-267c42b46fc5	Service Completed Successfully ✅	Your requested service (ATM Card Request) at Wegagen - 4 Kilo Branch has been completed. Thank you for banking with Wegagen Bank!	t	aed86231-957c-4ccf-968f-e704c8216b52	2026-08-27 10:33:53.592
b66bb735-aed1-4096-8d1f-153964fcd8e4	Queue Ticket Booked (A003) 🎫	Your ticket A003 for Teller Services at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	aed86231-957c-4ccf-968f-e704c8216b52	2026-08-26 19:25:28.773
a58e9cec-9af7-41b7-9601-7d2f56ad64b6	Queue Ticket Booked (M001) 🎫	Your ticket M001 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	aed86231-957c-4ccf-968f-e704c8216b52	2026-08-27 10:15:10.862
60e3bbea-d120-4e9c-8e65-b8249e6c2c8b	Queue Ticket Booked (M002) 🎫	Your ticket M002 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-29 16:03:50.751
b18d6d6a-1b32-4e9d-863c-309acb7502e3	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Account Opening at Wegagen Bank HQ is confirmed. Estimated wait: ~3 mins.	f	aed86231-957c-4ccf-968f-e704c8216b52	2026-08-30 12:15:41.02
cfa3ec7f-b8fd-4829-a2bf-477f40627fde	Queue Ticket Booked (M002) 🎫	Your ticket M002 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-31 08:24:45.361
1bc8e20c-4f0d-417a-8259-eb56bd19fed5	Queue Ticket Booked (M005) 🎫	Your ticket M005 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 11:02:08.484
de7629d8-ad96-4163-9e6f-8857b1c759fb	Now Serving: Ticket M005 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for ATM Card Request.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-27 11:02:16.605
939a9c49-192a-4f80-8c71-80438d77bdac	Queue Ticket Booked (M001) 🎫	Your ticket M001 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~3 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 08:22:38.944
a4b9a11a-67de-4a57-8ef5-34b2ba1961b4	Service Completed Successfully ✅	Your requested service (ATM Card Request) at Wegagen - 4 Kilo Branch has been completed. Thank you for banking with Wegagen Bank!	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 08:49:17.415
d88e34fa-40ee-4622-838a-3fbccacd88f0	Queue Ticket Booked (M003) 🎫	Your ticket M003 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~2 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 10:09:43.655
3d5e83b5-0826-4acf-8c28-d4d1b383dd9d	Service Completed Successfully ✅	Your requested service (ATM Card Request) at Wegagen - 4 Kilo Branch has been completed. Thank you for banking with Wegagen Bank!	t	114c84da-d920-45c2-b038-f02d14234016	2026-08-31 08:49:56.822
ce856899-98d9-4645-b08b-6ecab41c9281	Queue Ticket Booked (L001) 🎫	Your ticket L001 for Loan Consultation at Wegagen - Addis Ketema Branch is confirmed. Estimated wait: ~2 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:04:13.86
ed0a7a28-bafa-43ea-92d1-4e28bd029ff2	Queue Ticket Booked (M004) 🎫	Your ticket M004 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~2 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:04:27.694
4c72b723-f3d2-4a7b-831f-fe0a4126cab9	Queue Ticket Booked (A001) 🎫	Your ticket A001 for Account Opening at Wegagen - Arada Branch is confirmed. Estimated wait: ~2 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:04:35.903
7faeb3a1-75c3-40c2-82e3-4a5a102f3e86	Queue Ticket Booked (M005) 🎫	Your ticket M005 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~2 mins.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:05:37.304
b6b52313-52bd-4ace-9862-e1a42ad3cd58	Now Serving: Ticket M005 🔔	Please proceed to Counter 01 at Wegagen - 4 Kilo Branch for ATM Card Request.	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:06:46.037
8dd787d5-0d64-41b4-a9f6-fd171f105616	Service Completed Successfully ✅	Your requested service (ATM Card Request) at Wegagen - 4 Kilo Branch has been completed. Thank you for banking with Wegagen Bank!	t	c434e996-2cb2-4913-b2af-233c45dfe134	2026-08-31 11:07:09.625
c10d7cc0-a456-4c61-b125-3dc890889d83	Queue Ticket Booked (M001) 🎫	Your ticket M001 for ATM Card Request at Wegagen - 4 Kilo Branch is confirmed. Estimated wait: ~2 mins.	f	114c84da-d920-45c2-b038-f02d14234016	2026-09-17 09:15:49.283
\.


--
-- Data for Name: QueueTicket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QueueTicket" (id, "ticketNumber", status, "estimatedWaitMins", "userId", "branchId", "serviceId", "createdAt", "updatedAt", "isArchivedByEmployee", "servedByUserId") FROM stdin;
15b07096-8934-4790-8abb-ab64eb76b7ed	A001	CANCELLED	3	114c84da-d920-45c2-b038-f02d14234016	fedbeda3-3992-41c9-87bd-4789314747db	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-24 08:29:31.665	2026-08-24 08:48:31.403	f	\N
9bd6f538-970a-4c0f-94e3-fdb32c15a4f0	A001	CANCELLED	3	c434e996-2cb2-4913-b2af-233c45dfe134	dd92d2b6-4392-491a-bb87-ddc9c679fb05	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-24 08:54:15.573	2026-08-24 08:56:02.642	f	\N
315ca4b6-be96-46ab-b0cc-503698e90e61	A001	CANCELLED	3	114c84da-d920-45c2-b038-f02d14234016	a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-20 09:05:48.184	2026-08-24 11:59:19.104	f	\N
24660f84-95e6-443f-be02-972e75a3f7ea	L001	CANCELLED	3	c434e996-2cb2-4913-b2af-233c45dfe134	fedbeda3-3992-41c9-87bd-4789314747db	79fd27c2-ea5c-44bb-b42b-2b5121f441ab	2026-08-27 10:22:06.691	2026-08-27 10:40:47.069	f	\N
7608b3aa-9b1e-4cab-9933-0fe64c9a27f9	M001	COMPLETED	3	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-31 08:22:38.922	2026-08-31 08:49:17.39	f	\N
7e195850-18d7-41fc-b9e7-d7a56a330867	A002	COMPLETED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-26 11:39:31.851	2026-08-26 11:41:36.307	f	\N
a706db1d-61db-4fdd-ac5c-0bc3fcef9e62	M002	COMPLETED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-31 08:24:45.353	2026-08-31 08:49:56.81	f	\N
9cdb3e6b-4653-4026-b735-96e0a24527c1	A003	COMPLETED	3	aed86231-957c-4ccf-968f-e704c8216b52	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-26 19:25:28.706	2026-08-27 08:16:20.827	f	\N
56a0fe24-f43b-4568-9db8-932b31baaaf9	A001	CANCELLED	3	f963d587-36f3-41be-8f5a-db397dd3f4eb	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-27 08:38:45.904	2026-08-27 08:40:14.116	f	\N
5a600009-fa74-46fd-8ea8-8fbeb30948be	M003	CANCELLED	2	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-31 10:09:43.641	2026-08-31 10:11:29.32	f	\N
0dea40ea-3a6b-4885-a718-135079a24961	A002	COMPLETED	3	f963d587-36f3-41be-8f5a-db397dd3f4eb	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-27 08:40:28.185	2026-08-27 08:41:33.879	f	\N
6b5144fa-515b-4e31-a316-bf38dfec0f6c	A001	CANCELLED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-24 12:03:18.708	2026-08-27 11:26:42.12	t	\N
fc2c3b97-75e7-4bd5-ab98-2b678980e604	A001	COMPLETED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	33f6b531-c5aa-4655-8415-9269848399f8	2026-08-26 08:38:54.625	2026-08-27 11:26:45.889	t	\N
aff1e94f-73c3-4179-b34c-28ba51e3834c	M003	COMPLETED	3	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-27 10:22:19.818	2026-08-27 10:31:06.285	f	\N
f14c5a61-de46-493a-a840-0dd2d87711a1	M002	COMPLETED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-27 10:21:12.081	2026-08-27 10:31:31.881	f	\N
b7d44b49-0659-42d4-bac7-bfbcec0940f7	L001	CANCELLED	2	c434e996-2cb2-4913-b2af-233c45dfe134	fedbeda3-3992-41c9-87bd-4789314747db	79fd27c2-ea5c-44bb-b42b-2b5121f441ab	2026-08-31 11:04:13.847	2026-08-31 11:04:21.188	f	\N
f78cdef6-17c1-4f01-bf1d-a3e3324ef4e7	M001	COMPLETED	3	aed86231-957c-4ccf-968f-e704c8216b52	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-27 10:15:10.857	2026-08-27 11:27:13.314	t	\N
4b644203-5bda-42f4-ab7d-d6cab88ac072	M004	CANCELLED	3	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-27 10:40:59.919	2026-08-27 11:27:35.778	t	\N
105f6285-30b6-488c-9558-06951c41ede4	M001	CANCELLED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-29 10:24:41.794	2026-08-29 10:24:48.073	f	\N
910d83fa-487f-4526-a5fe-cb0d77868d1b	M002	CANCELLED	3	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-29 16:03:50.736	2026-08-30 08:29:30.432	f	\N
9970a077-a2a9-41a7-aa98-84e3871afbbd	M005	CANCELLED	3	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-27 11:02:08.48	2026-08-30 08:37:13.022	f	\N
a0d06412-7306-46cb-bd0d-07ec383222eb	A001	WAITING	3	aed86231-957c-4ccf-968f-e704c8216b52	dd92d2b6-4392-491a-bb87-ddc9c679fb05	531fea2d-7866-464d-b07f-a9b49de6b9d5	2026-08-30 12:15:41.001	2026-08-30 12:15:41.001	f	\N
8e6c4d52-f711-43af-abca-84be3eb6db70	M005	COMPLETED	2	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-31 11:05:37.293	2026-08-31 11:07:09.611	f	\N
f9bd65f4-ec08-4ddc-a7f1-658f334ff5da	A001	CANCELLED	2	c434e996-2cb2-4913-b2af-233c45dfe134	06bb35e2-61f8-4037-8cfb-478843a141a4	531fea2d-7866-464d-b07f-a9b49de6b9d5	2026-08-31 11:04:35.895	2026-08-31 11:04:40.729	f	\N
33d9b48d-5db0-4096-816c-ceb914db6557	M004	CANCELLED	2	c434e996-2cb2-4913-b2af-233c45dfe134	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-08-31 11:04:27.685	2026-08-31 11:04:45.851	f	\N
f3013751-8523-414a-bf8f-12830862a1c0	M001	CANCELLED	2	114c84da-d920-45c2-b038-f02d14234016	8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	2026-09-17 09:15:49.273	2026-10-02 18:42:41.166	f	\N
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Service" (id, name, description, "createdAt", "updatedAt") FROM stdin;
33f6b531-c5aa-4655-8415-9269848399f8	Teller Services	Cash deposits, withdrawals, and utility payments	2026-08-18 08:31:39.549	2026-08-18 08:31:39.549
713f7165-ef41-4006-9c39-c77b070990c8	Forex / FX	Foreign currency exchange and telegraphic transfers	2026-08-18 08:31:39.586	2026-08-18 08:31:39.586
3ceb9c83-ba25-4d75-9023-d325db69914b	ATM / CDM	Card issuance, PIN reset, and cash deposit machine support	2026-08-18 08:31:39.61	2026-08-18 08:31:39.61
523ce3a5-1e52-4c54-aff4-9d64c8349bde	Loan / Credit	Personal, business, and mortgage loan consultations	2026-08-18 08:31:39.636	2026-08-18 08:31:39.636
531fea2d-7866-464d-b07f-a9b49de6b9d5	Account Opening	Open new savings, current, salary, or interest-free accounts	2026-08-18 08:31:39.596	2026-08-27 09:14:36.318
2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c	ATM Card Request	New debit card request, PIN reset, card replacement, and activation	2026-08-27 09:14:36.365	2026-08-27 09:14:36.365
f3a7f719-6eed-4f46-9979-23ca4ebd125a	Cash Services	Cash deposits, withdrawals, and utility/bill payments	2026-08-27 09:14:36.367	2026-08-27 09:14:36.367
79fd27c2-ea5c-44bb-b42b-2b5121f441ab	Loan Consultation	Personal loan, auto loan, mortgage, and SME business credit consultations	2026-08-27 09:14:36.368	2026-08-27 09:14:36.368
da4e597a-2ea6-444b-8137-a71c6856aedc	Forex Exchange	Foreign currency buy/sell, remittance, and swift telegraphic transfers	2026-08-27 09:14:36.37	2026-08-27 09:14:36.37
4b0434ff-4077-458e-879d-52df95388060	Digital Banking	Mobile banking app setup, password reset, and internet banking	2026-08-27 09:14:36.372	2026-08-27 09:14:36.372
544c16a7-d114-41f0-8a7b-7449f0c9701b	VIP Banking	Priority customer banking and private wealth advisory	2026-08-18 08:31:39.623	2026-08-27 09:14:36.374
6523113e-2901-4c54-9130-e07d3e8b9df0	Customer Support	General inquiries, complaints, and account statement requests	2026-08-27 09:14:36.377	2026-08-27 09:14:36.377
750447b6-73aa-472b-8afd-103ec51b06d0	Savings Account	Open and manage personal savings accounts and related services	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
23a3028c-5fc2-4823-a268-983a9b4cf4c9	Current Account	Open and manage current accounts for individuals and businesses	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
a40f8eef-c91c-48ca-aef5-f1b026651472	Fixed Deposit	Open, manage, and inquire about fixed or time deposit accounts	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
163b6dee-c189-4c70-978a-1b471cfdb13a	Foreign Currency Account	Open and manage foreign currency savings and current accounts	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
d07af1e8-251f-478c-a0bf-3a838794609a	Account Statement	Request printed or electronic account statements and transaction history	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
9f5d4066-5668-423d-a24f-7b94f9908721	Balance Inquiry	Check account balance and recent account transactions	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
5527ce7b-7424-43d7-8639-c1fd72f7c0b1	Local Money Transfer	Send and receive money between local bank accounts	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
969fb3e2-2589-467c-97c1-1171b1e2e612	International Remittance	Send and receive international money transfers and remittances	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
a843c901-b341-43c3-9cf8-f387767124a1	Bill Payment	Pay electricity, water, telephone, internet, and other bills	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
77351800-80ee-4396-b5cd-97b342cc8c1e	School Fee Payment	Pay school, college, and university tuition and related fees	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
1f020e4d-178b-4cd6-8dd8-32fcc927fc87	Government Payment	Process eligible government fees, taxes, and other payments	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
9b51e5e0-cd4b-4a2c-99b7-bce46552972f	Merchant Payment	Make payments to merchants using supported banking payment channels	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
c17b981c-dbe9-4072-a2e5-7c8143f2b32e	Salary Services	Salary account services, salary processing, and salary-related inquiries	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
119bf72d-6c58-4f47-ba55-67fe153e6828	Debit Card Replacement	Request replacement of a lost, damaged, or expired debit card	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
c0b97cac-4140-4487-a98e-8f4c9bad5e2b	Card Activation	Activate a newly issued debit or ATM card	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
9ed0336f-8828-4505-a429-a1edb13e8e4f	Card Blocking	Block a lost, stolen, or compromised bank card	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
5c2ee033-2d69-4d8b-9113-7246ba5abf75	Mobile Banking Registration	Register, activate, or troubleshoot mobile banking services	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
c1597fb2-c582-43d8-8bb2-56a129abe06d	Internet Banking	Register and receive support for internet banking services	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
3c492b17-48c1-45b7-a5c9-c0ef11216a62	USSD Banking	Register and receive support for USSD-based banking services	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
a0b17702-3cf3-40b2-b5c4-d441a72aebf9	Personal Loan Application	Apply for personal loans and receive information about eligibility and requirements	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
348207de-8d23-4905-a2d6-677f9d599f64	Business Loan Application	Apply for business and SME financing facilities	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
bdcb0acd-6a70-4c8c-83c8-05a324e74f84	Mortgage Loan	Apply for housing and mortgage financing	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
175e5c52-0791-44b3-b50e-ed1c0feb3f68	Vehicle Loan	Apply for automobile and vehicle financing	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
f064f6b8-2844-4714-93e1-60cd2515056b	Loan Repayment	Make loan repayments and receive loan account information	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
c43f28a8-dc67-4f22-a2ad-4c2657fd1a2a	Overdraft Facility	Apply for and manage approved overdraft facilities	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
e72044b0-b5de-4877-97ba-40f9d85488d3	Bank Guarantee	Request bank guarantees including performance, bid, and payment guarantees	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
060066bf-bf36-4cd8-afd8-f62e6d2c88d1	Letter of Credit	Request and manage letters of credit for international trade transactions	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
cf4be660-d882-42d1-bc5c-1aee391c7dfb	Cheque Services	Request cheque books, deposit cheques, and receive cheque-related services	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
e5241f85-0907-4d79-96ea-890875c5307e	Bank Draft	Request and process bank drafts and similar guaranteed payment instruments	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
e3d595f5-4603-431b-922f-5de260bd9fa2	Safe Deposit Box	Access and manage safe deposit box services for valuable documents and items	2026-08-31 12:13:00.446	2026-08-31 12:13:00.446
4a83a643-d198-49b5-9a30-3ab7fc458966	Savings Account Opening	Individual, youth, women, and high-yield savings	2026-08-31 10:39:57.731	2026-08-31 10:39:57.731
b2f80ef5-293e-4460-82d3-53755babb527	Current & Checking Account	Commercial and personal checking accounts	2026-08-31 10:39:57.795	2026-08-31 10:39:57.795
4ec74973-7295-473f-8941-fccbf2471895	Fixed Time Deposit	High-yield term deposit investment contracts	2026-08-31 10:39:57.799	2026-08-31 10:39:57.799
9ab4334d-2699-4c7b-9559-01151ff11cf0	Interest-Free Banking (Amana)	Sharia-compliant ethical Islamic banking	2026-08-31 10:39:57.801	2026-08-31 10:39:57.801
26bd7df8-c444-4c57-b78e-0e96c8127557	Salary Account Processing	Corporate payroll and institutional employee accounts	2026-08-31 10:39:57.802	2026-08-31 10:39:57.802
4ec43623-5892-4b18-b983-d8c6d6232cf5	Student & Youth Banking	Subsidized student and teenage banking accounts	2026-08-31 10:39:57.804	2026-08-31 10:39:57.804
19c1570e-2c6c-4a09-87ee-e2274ff2b3d7	ATM & Debit Card Issuance	Contactless debit cards, issuance & renewals	2026-08-31 10:39:57.807	2026-08-31 10:39:57.807
85b1d17d-1152-4c84-9219-3689a57f9439	Card PIN Reset & Unblock	Instant PIN regeneration and card credential unlock	2026-08-31 10:39:57.814	2026-08-31 10:39:57.814
844374ce-8348-41aa-b543-ef9a403a244e	POS Merchant Terminal Setup	Point of Sale merchant machine installation	2026-08-31 10:39:57.816	2026-08-31 10:39:57.816
038e4bf2-1e12-4fc2-9e2e-06d32a0ac892	International Visa/Mastercard	Prepaid travel cards and international online payments	2026-08-31 10:39:57.819	2026-08-31 10:39:57.819
f33170f2-5a75-44ac-b40b-49ff4a43da11	Cash Deposit & Fast Teller	High-speed cash depositing & counter receipts	2026-08-31 10:39:57.82	2026-08-31 10:39:57.82
dfb9f9d6-841a-4027-a813-bc88139d4787	Cash Withdrawal	Counter cash withdrawals and cheque encashment	2026-08-31 10:39:57.822	2026-08-31 10:39:57.822
5eda80f7-e9e4-4161-a045-6ea31a0363a8	Utility & Tax Bill Payments	Water, electricity, customs, and ERCA tax payments	2026-08-31 10:39:57.823	2026-08-31 10:39:57.823
e380278f-f14e-4f43-88d2-ddba1d1ac2d2	Cheque Clearance & CPO	Certified payment orders (CPO) and clearance	2026-08-31 10:39:57.839	2026-08-31 10:39:57.839
7fd7f4dc-24e0-4559-af39-bb88974426f7	School & University Fee Payment	Tuition deposits and institutional payment receipts	2026-08-31 10:39:57.841	2026-08-31 10:39:57.841
0162f777-3e4a-442d-a840-77172c1329fd	Forex Cash Exchange	Foreign currency spot buying and selling	2026-08-31 10:39:57.843	2026-08-31 10:39:57.843
ab9928d5-eecf-49d1-bb94-c9cf9e6adbeb	International Inward Remittance	Western Union, MoneyGram, Ria, and Remitly payouts	2026-08-31 10:39:57.846	2026-08-31 10:39:57.846
d5cc0b40-856b-4205-af9f-5bdbac746183	SWIFT Outward Wire Transfer	Telegraphic transfers for imports and education	2026-08-31 10:39:57.848	2026-08-31 10:39:57.848
472d6274-6172-468f-b81c-da541555c851	Letter of Credit (LC) Processing	Trade finance and commercial import/export LC	2026-08-31 10:39:57.85	2026-08-31 10:39:57.85
bea37c94-4503-482e-9667-df1ddb689223	Forex Retention Account	Exporters and diaspora USD/EUR retention accounts	2026-08-31 10:39:57.852	2026-08-31 10:39:57.852
96cabf1a-2ed9-43fd-91ef-488bc2d8e777	Personal & Salary Advance Loan	Short-term consumer and personal financing	2026-08-31 10:39:57.854	2026-08-31 10:39:57.854
51b466e7-30eb-4839-a409-0dcf9ca7d1e2	Vehicle & Asset Financing	Automobile and commercial transport asset loans	2026-08-31 10:39:57.856	2026-08-31 10:39:57.856
737a1818-fe37-4b9d-b9ca-2f0af28698f6	Mortgage & Home Loan	Residential property acquisition and construction credit	2026-08-31 10:39:57.859	2026-08-31 10:39:57.859
b86a665d-2e0a-4ad5-9f62-17dc7da4b070	SME & Working Capital Credit	Trade, retail, and manufacturing credit lines	2026-08-31 10:39:57.861	2026-08-31 10:39:57.861
7e0289f1-33df-4b2b-b818-dd2071ea91f9	Agricultural & Export Financing	Commodity export and agricultural value chain funding	2026-08-31 10:39:57.863	2026-08-31 10:39:57.863
61ea4dcb-b669-465d-9b2d-6fa42d67c2c5	Mobile App & Internet Banking	Wegagen Mobile App onboarding and web banking	2026-08-31 10:39:57.865	2026-08-31 10:39:57.865
aed37528-1543-4293-a857-87bd63c73e2c	Telebirr & Wallet Integration	CBE/Telebirr seamless wallet linkage	2026-08-31 10:39:57.867	2026-08-31 10:39:57.867
febee699-80c5-46f6-befe-c1a210c2de19	SMS & Email Alert Subscription	Real-time instant transaction notifications	2026-08-31 10:39:57.869	2026-08-31 10:39:57.869
db233e40-b931-4e25-b046-c1420603dad2	E-Commerce Payment Gateway	Merchant online payment integration and APIs	2026-08-31 10:39:57.871	2026-08-31 10:39:57.871
1792e122-bdc4-40ee-bf2c-0fe7de0d7c9b	VIP Priority & Private Banking	Dedicated relationship managers and private lounge access	2026-08-31 10:39:57.873	2026-08-31 10:39:57.873
2958ef38-5690-4260-8072-96f3a4b9f225	Corporate Treasury & Escrow	Enterprise liquidity management and escrow services	2026-08-31 10:39:57.875	2026-08-31 10:39:57.875
ef1e7861-f8ff-4880-bdb9-15be4f73b879	Bank Guarantee & Bid Bond	Performance bonds, bid bonds, and advance payment guarantees	2026-08-31 10:39:57.877	2026-08-31 10:39:57.877
1768c478-e340-4be3-a8c1-23cdf82892af	Customer Care & Statement Requests	General inquiries, complaints, and official account statements	2026-08-31 10:39:57.879	2026-08-31 10:39:57.879
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "clerkUserId", email, phone, role, "isActive", "createdAt", "updatedAt", "firstName", "lastName") FROM stdin;
aed86231-957c-4ccf-968f-e704c8216b52	user_3ISyTmw0GVaQEACqMa85jxejlPc	shewa8605@gmail.com	+251910277171	customer	t	2026-08-26 19:24:40.831	2026-08-30 20:26:55.45	Shewit	Fikadu
c434e996-2cb2-4913-b2af-233c45dfe134	user_3HlMWOMITTALUY7WSUEVhA4OU4Q	yeamlaksisay420@gmail.com	+251939208663	customer	t	2026-08-18 11:33:10.355	2026-09-17 09:14:07.278	Yeamlak	Sisay
114c84da-d920-45c2-b038-f02d14234016	user_3HjyjX4KviHXeDlwexUQzdLkjw0	yamlaksisay419@gmail.com	+251939208663	customer	t	2026-08-17 18:53:41.493	2026-10-02 18:47:18.88	Yeamlak	Sisay
237df301-7fc5-4a94-a8ed-5890801b8c4a	user_3I5KCuYV4sdcDTS6I7gEq5X9W4E	cryptobtq612@gmail.com	+2510939208663	employee	t	2026-08-18 11:30:54.233	2026-10-02 18:48:10.077	Crypto	Btq
f963d587-36f3-41be-8f5a-db397dd3f4eb	user_3IUX1aS1RxBEvojBmK9WbPOVm8h	yafuaman.alxbackend@gmail.com	+251900001212	customer	t	2026-08-27 08:38:26.917	2026-08-27 08:39:56.233	Yafet	Yafet
\.


--
-- Data for Name: _BranchToService; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_BranchToService" ("A", "B") FROM stdin;
8d715c71-8e14-4b96-9c67-d3bceee52c23	2c97d7ed-b478-4b8e-a15a-9ccbfc30b64c
fedbeda3-3992-41c9-87bd-4789314747db	79fd27c2-ea5c-44bb-b42b-2b5121f441ab
dd92d2b6-4392-491a-bb87-ddc9c679fb05	531fea2d-7866-464d-b07f-a9b49de6b9d5
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	4a83a643-d198-49b5-9a30-3ab7fc458966
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	b2f80ef5-293e-4460-82d3-53755babb527
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	4ec74973-7295-473f-8941-fccbf2471895
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	9ab4334d-2699-4c7b-9559-01151ff11cf0
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	4ec43623-5892-4b18-b983-d8c6d6232cf5
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	85b1d17d-1152-4c84-9219-3689a57f9439
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	844374ce-8348-41aa-b543-ef9a403a244e
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	038e4bf2-1e12-4fc2-9e2e-06d32a0ac892
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	f33170f2-5a75-44ac-b40b-49ff4a43da11
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	dfb9f9d6-841a-4027-a813-bc88139d4787
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	5eda80f7-e9e4-4161-a045-6ea31a0363a8
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	e380278f-f14e-4f43-88d2-ddba1d1ac2d2
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	0162f777-3e4a-442d-a840-77172c1329fd
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	ab9928d5-eecf-49d1-bb94-c9cf9e6adbeb
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	d5cc0b40-856b-4205-af9f-5bdbac746183
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	472d6274-6172-468f-b81c-da541555c851
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	bea37c94-4503-482e-9667-df1ddb689223
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	96cabf1a-2ed9-43fd-91ef-488bc2d8e777
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	51b466e7-30eb-4839-a409-0dcf9ca7d1e2
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	737a1818-fe37-4b9d-b9ca-2f0af28698f6
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	7e0289f1-33df-4b2b-b818-dd2071ea91f9
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	61ea4dcb-b669-465d-9b2d-6fa42d67c2c5
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	aed37528-1543-4293-a857-87bd63c73e2c
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	febee699-80c5-46f6-befe-c1a210c2de19
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	db233e40-b931-4e25-b046-c1420603dad2
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	1792e122-bdc4-40ee-bf2c-0fe7de0d7c9b
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	2958ef38-5690-4260-8072-96f3a4b9f225
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	ef1e7861-f8ff-4880-bdb9-15be4f73b879
de944cde-a4b7-4b9d-8e89-e68dfc2f4b56	1768c478-e340-4be3-a8c1-23cdf82892af
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	4a83a643-d198-49b5-9a30-3ab7fc458966
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	f33170f2-5a75-44ac-b40b-49ff4a43da11
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	0162f777-3e4a-442d-a840-77172c1329fd
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	ab9928d5-eecf-49d1-bb94-c9cf9e6adbeb
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	b86a665d-2e0a-4ad5-9f62-17dc7da4b070
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	febee699-80c5-46f6-befe-c1a210c2de19
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	db233e40-b931-4e25-b046-c1420603dad2
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	1792e122-bdc4-40ee-bf2c-0fe7de0d7c9b
a7e50722-58fb-4e85-8a9f-8ab7eb03fe3b	2958ef38-5690-4260-8072-96f3a4b9f225
5874536a-5846-415c-9eff-0e26e173a1d9	4a83a643-d198-49b5-9a30-3ab7fc458966
5874536a-5846-415c-9eff-0e26e173a1d9	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
5874536a-5846-415c-9eff-0e26e173a1d9	f33170f2-5a75-44ac-b40b-49ff4a43da11
5874536a-5846-415c-9eff-0e26e173a1d9	dfb9f9d6-841a-4027-a813-bc88139d4787
5874536a-5846-415c-9eff-0e26e173a1d9	5eda80f7-e9e4-4161-a045-6ea31a0363a8
5874536a-5846-415c-9eff-0e26e173a1d9	7fd7f4dc-24e0-4559-af39-bb88974426f7
5874536a-5846-415c-9eff-0e26e173a1d9	d5cc0b40-856b-4205-af9f-5bdbac746183
5874536a-5846-415c-9eff-0e26e173a1d9	db233e40-b931-4e25-b046-c1420603dad2
5874536a-5846-415c-9eff-0e26e173a1d9	1792e122-bdc4-40ee-bf2c-0fe7de0d7c9b
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	4a83a643-d198-49b5-9a30-3ab7fc458966
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	9ab4334d-2699-4c7b-9559-01151ff11cf0
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	85b1d17d-1152-4c84-9219-3689a57f9439
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	f33170f2-5a75-44ac-b40b-49ff4a43da11
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	dfb9f9d6-841a-4027-a813-bc88139d4787
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	5eda80f7-e9e4-4161-a045-6ea31a0363a8
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	e380278f-f14e-4f43-88d2-ddba1d1ac2d2
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	0162f777-3e4a-442d-a840-77172c1329fd
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	472d6274-6172-468f-b81c-da541555c851
ac995ef9-fb8b-49a0-b67e-fbe9a1d564a5	b86a665d-2e0a-4ad5-9f62-17dc7da4b070
8828c6ac-6e64-4b47-ad22-4b732108c5da	4a83a643-d198-49b5-9a30-3ab7fc458966
8828c6ac-6e64-4b47-ad22-4b732108c5da	4ec43623-5892-4b18-b983-d8c6d6232cf5
8828c6ac-6e64-4b47-ad22-4b732108c5da	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
8828c6ac-6e64-4b47-ad22-4b732108c5da	f33170f2-5a75-44ac-b40b-49ff4a43da11
8828c6ac-6e64-4b47-ad22-4b732108c5da	472d6274-6172-468f-b81c-da541555c851
8828c6ac-6e64-4b47-ad22-4b732108c5da	b86a665d-2e0a-4ad5-9f62-17dc7da4b070
8828c6ac-6e64-4b47-ad22-4b732108c5da	aed37528-1543-4293-a857-87bd63c73e2c
8828c6ac-6e64-4b47-ad22-4b732108c5da	1792e122-bdc4-40ee-bf2c-0fe7de0d7c9b
8828c6ac-6e64-4b47-ad22-4b732108c5da	ef1e7861-f8ff-4880-bdb9-15be4f73b879
7f52270d-3d26-4c25-b913-b522a9ce7665	4a83a643-d198-49b5-9a30-3ab7fc458966
7f52270d-3d26-4c25-b913-b522a9ce7665	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
7f52270d-3d26-4c25-b913-b522a9ce7665	f33170f2-5a75-44ac-b40b-49ff4a43da11
7f52270d-3d26-4c25-b913-b522a9ce7665	5eda80f7-e9e4-4161-a045-6ea31a0363a8
7f52270d-3d26-4c25-b913-b522a9ce7665	0162f777-3e4a-442d-a840-77172c1329fd
7f52270d-3d26-4c25-b913-b522a9ce7665	ab9928d5-eecf-49d1-bb94-c9cf9e6adbeb
7f52270d-3d26-4c25-b913-b522a9ce7665	51b466e7-30eb-4839-a409-0dcf9ca7d1e2
7f52270d-3d26-4c25-b913-b522a9ce7665	7e0289f1-33df-4b2b-b818-dd2071ea91f9
8bc84e96-c28e-4181-81ac-e6011ffc92e8	4a83a643-d198-49b5-9a30-3ab7fc458966
8bc84e96-c28e-4181-81ac-e6011ffc92e8	b2f80ef5-293e-4460-82d3-53755babb527
8bc84e96-c28e-4181-81ac-e6011ffc92e8	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
8bc84e96-c28e-4181-81ac-e6011ffc92e8	f33170f2-5a75-44ac-b40b-49ff4a43da11
8bc84e96-c28e-4181-81ac-e6011ffc92e8	dfb9f9d6-841a-4027-a813-bc88139d4787
8bc84e96-c28e-4181-81ac-e6011ffc92e8	d5cc0b40-856b-4205-af9f-5bdbac746183
8bc84e96-c28e-4181-81ac-e6011ffc92e8	51b466e7-30eb-4839-a409-0dcf9ca7d1e2
8bc84e96-c28e-4181-81ac-e6011ffc92e8	61ea4dcb-b669-465d-9b2d-6fa42d67c2c5
e8964f0c-6103-4650-8c8d-8d1c34c5d755	4a83a643-d198-49b5-9a30-3ab7fc458966
e8964f0c-6103-4650-8c8d-8d1c34c5d755	4ec74973-7295-473f-8941-fccbf2471895
e8964f0c-6103-4650-8c8d-8d1c34c5d755	4ec43623-5892-4b18-b983-d8c6d6232cf5
e8964f0c-6103-4650-8c8d-8d1c34c5d755	85b1d17d-1152-4c84-9219-3689a57f9439
e8964f0c-6103-4650-8c8d-8d1c34c5d755	f33170f2-5a75-44ac-b40b-49ff4a43da11
e8964f0c-6103-4650-8c8d-8d1c34c5d755	7fd7f4dc-24e0-4559-af39-bb88974426f7
e8964f0c-6103-4650-8c8d-8d1c34c5d755	febee699-80c5-46f6-befe-c1a210c2de19
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	4a83a643-d198-49b5-9a30-3ab7fc458966
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	f33170f2-5a75-44ac-b40b-49ff4a43da11
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	5eda80f7-e9e4-4161-a045-6ea31a0363a8
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	d5cc0b40-856b-4205-af9f-5bdbac746183
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	737a1818-fe37-4b9d-b9ca-2f0af28698f6
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	b86a665d-2e0a-4ad5-9f62-17dc7da4b070
64b7cb9a-09f2-47f3-b6f6-d9e591b4dcb1	2958ef38-5690-4260-8072-96f3a4b9f225
35fdc856-f6f5-4da0-9b09-148c040c2406	4a83a643-d198-49b5-9a30-3ab7fc458966
35fdc856-f6f5-4da0-9b09-148c040c2406	b2f80ef5-293e-4460-82d3-53755babb527
35fdc856-f6f5-4da0-9b09-148c040c2406	19c1570e-2c6c-4a09-87ee-e2274ff2b3d7
35fdc856-f6f5-4da0-9b09-148c040c2406	f33170f2-5a75-44ac-b40b-49ff4a43da11
35fdc856-f6f5-4da0-9b09-148c040c2406	0162f777-3e4a-442d-a840-77172c1329fd
35fdc856-f6f5-4da0-9b09-148c040c2406	bea37c94-4503-482e-9667-df1ddb689223
06bb35e2-61f8-4037-8cfb-478843a141a4	531fea2d-7866-464d-b07f-a9b49de6b9d5
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
82414f34-ea1e-4e6a-9b3b-58af83d04772	742097055f6f135aa1b927bde794d6b6c058e881af414e9e0c41a903356aafea	2026-08-17 11:43:18.037338+03	20260817084318_init	\N	\N	2026-08-17 11:43:18.021874+03	1
\.


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: ForexAlert ForexAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForexAlert"
    ADD CONSTRAINT "ForexAlert_pkey" PRIMARY KEY (id);


--
-- Name: ForexRate ForexRate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForexRate"
    ADD CONSTRAINT "ForexRate_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: QueueTicket QueueTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueueTicket"
    ADD CONSTRAINT "QueueTicket_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _BranchToService _BranchToService_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BranchToService"
    ADD CONSTRAINT "_BranchToService_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ForexRate_currencyCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ForexRate_currencyCode_key" ON public."ForexRate" USING btree ("currencyCode");


--
-- Name: Service_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Service_name_key" ON public."Service" USING btree (name);


--
-- Name: User_clerkUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_clerkUserId_key" ON public."User" USING btree ("clerkUserId");


--
-- Name: _BranchToService_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_BranchToService_B_index" ON public."_BranchToService" USING btree ("B");


--
-- Name: Branch set_branch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_branch_updated_at BEFORE UPDATE ON public."Branch" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ForexRate set_forex_rate_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_forex_rate_updated_at BEFORE UPDATE ON public."ForexRate" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ForexAlert ForexAlert_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ForexAlert"
    ADD CONSTRAINT "ForexAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueTicket QueueTicket_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueueTicket"
    ADD CONSTRAINT "QueueTicket_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueTicket QueueTicket_servedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueueTicket"
    ADD CONSTRAINT "QueueTicket_servedByUserId_fkey" FOREIGN KEY ("servedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QueueTicket QueueTicket_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueueTicket"
    ADD CONSTRAINT "QueueTicket_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueTicket QueueTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueueTicket"
    ADD CONSTRAINT "QueueTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BranchToService _BranchToService_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BranchToService"
    ADD CONSTRAINT "_BranchToService_A_fkey" FOREIGN KEY ("A") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BranchToService _BranchToService_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_BranchToService"
    ADD CONSTRAINT "_BranchToService_B_fkey" FOREIGN KEY ("B") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZhG9LCIkyPADNd6AD5d6AZYyITJDkBldfZLydcTtYcwAEeblLMacdz3BTHEbgAf

