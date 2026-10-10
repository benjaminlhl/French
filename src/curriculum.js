// 12-week plan from complete beginner to confident A2 (with B1 skills for daily life and university).
// 6 lesson days + 1 review day per week, about 20 minutes each.
// Shared by the browser (lesson picker) and the server (lesson prompt).

export const WEEKS = [
  {
    theme: "Bonjour ! Premiers pas",
    days: [
      { t: "Saluer et se présenter", g: "bonjour/salut/au revoir, je m'appelle…, ça va ?, tu vs vous, pronunciation of silent final letters" },
      { t: "L'alphabet et épeler son nom", g: "alphabet, spelling your name and email (arobase, point), French vowel sounds u/ou, é/è" },
      { t: "Les nombres 0–20", g: "numbers 0–20, age (j'ai … ans), phone numbers said in pairs" },
      { t: "Le verbe être et les nationalités", g: "être in present, nationalities masculine/feminine, je suis étudiant(e)" },
      { t: "D'où viens-tu ?", g: "je viens de…, j'habite à…, countries with en/au, intonation questions" },
      { t: "Les mots de politesse", g: "s'il vous plaît, merci, pardon, excusez-moi, je ne comprends pas, vous pouvez répéter ?" },
      { t: "Révision semaine 1", g: "review + mini-test: introduce yourself fully, spell your name, give your phone number", review: true },
    ],
  },
  {
    theme: "Ma vie, ma famille",
    days: [
      { t: "Le verbe avoir", g: "avoir in present, j'ai un frère/une sœur, j'ai faim/soif/froid" },
      { t: "Les articles : un, une, le, la, les", g: "definite/indefinite articles, noun gender tips, plural" },
      { t: "La famille", g: "family members, possessives mon/ma/mes, ton/ta/tes" },
      { t: "Les nombres jusqu'à 100", g: "numbers 20–100 including soixante-dix, quatre-vingts, quatre-vingt-dix; prices and years" },
      { t: "Les jours, les mois, la date", g: "days, months, quel jour sommes-nous ?, c'est le 3 septembre, birthday" },
      { t: "Poser des questions", g: "est-ce que, qu'est-ce que, où, quand, comment, pourquoi, combien" },
      { t: "Révision semaine 2", g: "review + mini-test: talk about your family, dates, ask 5 questions", review: true },
    ],
  },
  {
    theme: "Manger et faire les courses",
    days: [
      { t: "À la boulangerie", g: "je voudrais…, une baguette, un croissant, c'est combien ?, paying (par carte, sans contact)" },
      { t: "Les verbes en -er", g: "present of -er verbs (parler, aimer, habiter, manger), j'aime / je n'aime pas" },
      { t: "Au café", g: "ordering drinks, un café, un crème, l'addition s'il vous plaît, sur place ou à emporter" },
      { t: "Le partitif", g: "du, de la, des, de l'; pas de; quantities (un kilo de, un paquet de, beaucoup de)" },
      { t: "Au supermarché et au marché", g: "food vocabulary, where is…?, c'est en promo, la caisse, un sac" },
      { t: "Au restaurant universitaire", g: "le RU / le Crous, menu items, je prends…, vegetarian, allergies" },
      { t: "Révision semaine 3", g: "review + mini-test: order at a café, buy groceries, talk about food you like", review: true },
    ],
  },
  {
    theme: "Se déplacer en ville",
    days: [
      { t: "Demander son chemin", g: "où est… ?, à gauche, à droite, tout droit, à côté de, en face de" },
      { t: "Aller et venir", g: "aller and venir in present, au/à la/aux, je vais à la fac" },
      { t: "Les transports", g: "métro, RER, bus, tram, un ticket, un pass Navigo / carte de transport, la ligne, la direction, changer à" },
      { t: "Dire l'heure", g: "quelle heure est-il ?, et quart, et demie, moins le quart, 24-hour time (14h30)" },
      { t: "Le futur proche", g: "aller + infinitive: je vais prendre le métro, plans for tomorrow" },
      { t: "Comprendre les annonces", g: "station/train announcements, en raison de, retard, voie, prochain arrêt, listening to fast speech" },
      { t: "Révision semaine 4", g: "review + mini-test: ask the way, buy a ticket, plan your day with times", review: true },
    ],
  },
  {
    theme: "Le logement",
    days: [
      { t: "Décrire un logement", g: "un studio, une chambre, une colocation, la cuisine, la salle de bains, meublé, il y a" },
      { t: "Les adjectifs", g: "adjective agreement and position (grand, petit, beau, cher, calme, lumineux)" },
      { t: "La négation", g: "ne…pas, ne…plus, ne…jamais, il n'y a pas de; spoken French drops 'ne'" },
      { t: "Visiter un appartement", g: "le loyer, les charges comprises, la caution, le garant, l'état des lieux, disponible quand ?" },
      { t: "Le verbe faire", g: "faire in present, faire les courses / le ménage / la cuisine / la lessive" },
      { t: "Les aides au logement", g: "la CAF, les APL, un dossier, une attestation, the Crous residence" },
      { t: "Révision semaine 5", g: "review + mini-test: describe your ideal flat and ask a landlord 5 questions", review: true },
    ],
  },
  {
    theme: "Démarches et banque",
    days: [
      { t: "Pouvoir, vouloir, devoir", g: "present of pouvoir/vouloir/devoir, je peux… ?, je dois…, je voudrais (polite)" },
      { t: "Ouvrir un compte bancaire", g: "un compte, un RIB, une carte bancaire, un justificatif de domicile, une pièce d'identité" },
      { t: "Remplir un formulaire", g: "nom, prénom, date de naissance, adresse, code postal, signature, cocher la case" },
      { t: "Le titre de séjour", g: "visa VLS-TS, validation en ligne, l'OFII, un rendez-vous, un récépissé, la préfecture" },
      { t: "Au téléphone", g: "allô, c'est de la part de qui ?, je vous appelle pour…, pouvez-vous parler plus lentement ?" },
      { t: "Un forfait mobile", g: "une carte SIM, un forfait, sans engagement, les gigas, la box internet" },
      { t: "Révision semaine 6", g: "review + mini-test: phone call to make an appointment and open a bank account", review: true },
    ],
  },
  {
    theme: "La vie à l'université",
    days: [
      { t: "Mes études", g: "j'étudie…, je suis en licence/master, la filière, les matières, field-specific vocabulary" },
      { t: "Les verbes en -ir et -re", g: "finir, choisir, prendre, comprendre, apprendre, attendre in present" },
      { t: "Ma routine (verbes pronominaux)", g: "se lever, se réveiller, s'habiller, se coucher, daily routine" },
      { t: "L'emploi du temps", g: "le CM, le TD, le TP, l'amphi, la salle, un partiel, le contrôle continu, l'ENT" },
      { t: "L'inscription à la fac", g: "l'inscription administrative / pédagogique, la scolarité, la carte étudiante, la CVEC" },
      { t: "Écrire un e-mail simple", g: "Bonjour Madame/Monsieur, je me permets de vous écrire…, cordialement; email to the secrétariat" },
      { t: "Révision semaine 7", g: "review + mini-test: describe your studies, timetable and daily routine", review: true },
    ],
  },
  {
    theme: "Raconter le passé",
    days: [
      { t: "Le passé composé avec avoir", g: "j'ai mangé, j'ai fini, j'ai pris; past participles of common verbs" },
      { t: "Le passé composé avec être", g: "aller, venir, partir, arriver, rester, naître… agreement (je suis allée)" },
      { t: "Raconter son week-end", g: "time markers: hier, le week-end dernier, d'abord, ensuite, après, enfin" },
      { t: "Participes irréguliers", g: "fait, eu, été, vu, dit, pu, voulu, dû, mis, lu" },
      { t: "La négation au passé", g: "je n'ai pas compris, je ne suis jamais allé(e)…, déjà / pas encore" },
      { t: "Raconter un problème", g: "j'ai perdu…, on m'a volé…, ma carte a été bloquée — telling what happened" },
      { t: "Révision semaine 8", g: "review + mini-test: tell the story of your last trip or weekend", review: true },
    ],
  },
  {
    theme: "Santé et services",
    days: [
      { t: "Le corps et les symptômes", g: "j'ai mal à la tête / au ventre / à la gorge, j'ai de la fièvre, je tousse" },
      { t: "Chez le médecin", g: "prendre rendez-vous (Doctolib), le médecin traitant, une ordonnance, depuis quand ?" },
      { t: "À la pharmacie", g: "un médicament, sans ordonnance, un comprimé, deux fois par jour, les conseils du pharmacien" },
      { t: "La sécurité sociale", g: "la carte Vitale, la mutuelle, être remboursé, l'Assurance Maladie, ameli" },
      { t: "Il faut et l'impératif", g: "il faut + infinitive, imperative (prenez, reposez-vous, n'oubliez pas)" },
      { t: "Les urgences", g: "le 15 / le 112, c'est urgent, appelez…, au secours, emergency phrases" },
      { t: "Révision semaine 9", g: "review + mini-test: describe symptoms to a doctor and understand instructions", review: true },
    ],
  },
  {
    theme: "Vie sociale",
    days: [
      { t: "Se faire des amis", g: "small talk with classmates, tu fais quoi ce week-end ?, on échange nos numéros ?" },
      { t: "Inviter, accepter, refuser", g: "ça te dit de… ?, avec plaisir, désolé(e), je ne peux pas, une autre fois" },
      { t: "Donner son avis", g: "je pense que, je trouve que, à mon avis, je suis d'accord / pas d'accord" },
      { t: "Comparer", g: "plus…que, moins…que, aussi…que, meilleur, le plus" },
      { t: "Les pronoms le, la, les, lui, leur", g: "direct and indirect object pronouns in present and passé composé" },
      { t: "Le français parlé", g: "on = nous, ouais, du coup, genre, trop bien, c'est relou, dropped 'ne', verlan basics" },
      { t: "Révision semaine 10", g: "review + mini-test: invite a friend, discuss opinions about a film or city", review: true },
    ],
  },
  {
    theme: "Le français académique",
    days: [
      { t: "Comprendre un cours magistral", g: "lecture structure signals: tout d'abord, ensuite, en effet, par conséquent, en résumé" },
      { t: "L'imparfait", g: "formation and uses: descriptions and habits in the past (quand j'étais petit…)" },
      { t: "Imparfait ou passé composé ?", g: "background vs event: il pleuvait quand je suis arrivé(e)" },
      { t: "Prendre des notes", g: "abbreviations (cad, pb, qqch, ds, ex, cf.), symbols, structuring notes" },
      { t: "Participer en classe", g: "Pourriez-vous répéter ?, J'ai une question, Qu'entendez-vous par… ?, travail de groupe" },
      { t: "Écrire à un professeur", g: "formal email: objet, Madame la Professeure, je vous serais reconnaissant(e)…, formules de politesse" },
      { t: "Révision semaine 11", g: "review + mini-test: summarise a short lecture extract and write a formal email", review: true },
    ],
  },
  {
    theme: "Prêt(e) pour la France !",
    days: [
      { t: "Le futur simple", g: "je serai, j'aurai, j'irai, je ferai; plans for the year in France" },
      { t: "Le conditionnel de politesse", g: "je voudrais, pourriez-vous, j'aimerais, ce serait possible de… ?" },
      { t: "Faire un exposé", g: "structuring a short presentation: introduction, plan, transitions, conclusion" },
      { t: "Exprimer cause et conséquence", g: "parce que, car, comme, donc, alors, c'est pourquoi" },
      { t: "Simulation : la première semaine", g: "full scenario chain: arrival, transport, flat, bank, university desk" },
      { t: "Bilan et plan de suite", g: "self-assessment against A2/B1, personal weak points, plan for continuing in France" },
      { t: "Révision finale", g: "final mixed test covering all 12 weeks, with a level estimate", review: true },
    ],
  },
];

export const TOTAL_DAYS = WEEKS.length * 7;

export function lessonFor(day) {
  const d = Math.min(Math.max(1, day), TOTAL_DAYS);
  const week = Math.ceil(d / 7);
  const w = WEEKS[week - 1];
  const lesson = w.days[(d - 1) % 7];
  return { day: d, week, theme: w.theme, ...lesson };
}

export function levelFor(day) {
  if (day <= 14) return "A0→A1 (complete beginner)";
  if (day <= 35) return "A1";
  if (day <= 56) return "A1+/A2";
  return "A2→B1";
}

export const SCENARIOS = [
  { id: "aeroport", emoji: "✈️", title: "Arrivée à l'aéroport", en: "Get from the airport to your address", role: "an information-desk agent at Paris-Charles-de-Gaulle airport", goal: "find out how to get to their address in the city, buy the right ticket, and understand which line/platform to take" },
  { id: "boulangerie", emoji: "🥖", title: "À la boulangerie", en: "Buy bread and pastries", role: "a friendly but busy boulangère with a queue behind the learner", goal: "order bread and pastries, ask a price, and pay" },
  { id: "cafe", emoji: "☕", title: "Au café", en: "Order and pay at a café", role: "a Parisian café waiter (efficient, a little brisk)", goal: "get a table, order a drink and something to eat, and ask for the bill" },
  { id: "logement", emoji: "🏠", title: "Visite d'un appartement", en: "Visit a flat for rent", role: "a landlord showing a small furnished studio near the university", goal: "ask about the rent, charges, deposit, guarantor, availability and whether it is eligible for CAF housing aid" },
  { id: "banque", emoji: "🏦", title: "Ouvrir un compte bancaire", en: "Open a bank account", role: "a bank advisor (conseiller/conseillère) in a high-street bank", goal: "open a student account, understand which documents are needed, and get a RIB and a bank card" },
  { id: "telephone", emoji: "📱", title: "Acheter un forfait mobile", en: "Get a phone plan", role: "a salesperson in a phone shop", goal: "choose a SIM-only plan with no commitment and understand the price and data" },
  { id: "titre", emoji: "🛂", title: "Le titre de séjour", en: "Residence permit questions", role: "an agent at the international students' welcome desk who helps with the VLS-TS visa validation and OFII", goal: "understand the steps to validate their student visa and what documents to prepare" },
  { id: "caf", emoji: "📄", title: "Demande d'aide au logement (CAF)", en: "Apply for housing aid", role: "a CAF advisor on the phone", goal: "find out whether they are eligible for APL and which documents to send" },
  { id: "inscription", emoji: "🎓", title: "Inscription à la fac", en: "Register at the university", role: "a staff member at the university's scolarité office", goal: "complete registration, get their student card, and understand their timetable and where to find it" },
  { id: "camarades", emoji: "👋", title: "Rencontrer des camarades", en: "Meet classmates on day one", role: "a friendly French student sitting next to the learner before the first lecture", goal: "introduce themselves, make small talk, and exchange contacts" },
  { id: "prof", emoji: "👩‍🏫", title: "Parler à un professeur", en: "Talk to a professor after class", role: "a university professor, polite and formal (uses vous)", goal: "ask a question about the lecture, an assignment deadline, and office hours" },
  { id: "groupe", emoji: "🧑‍🤝‍🧑", title: "Travail de groupe", en: "Organise a group project", role: "a classmate in a TD group project", goal: "agree on who does what, set a meeting time and place, and exchange contacts" },
  { id: "medecin", emoji: "🩺", title: "Chez le médecin", en: "See a doctor", role: "a general practitioner (médecin généraliste)", goal: "explain their symptoms, answer the doctor's questions, and understand the prescription" },
  { id: "pharmacie", emoji: "💊", title: "À la pharmacie", en: "Get something at the pharmacy", role: "a pharmacist", goal: "describe a minor problem, get a medicine without prescription, and understand the dosage" },
  { id: "supermarche", emoji: "🛒", title: "Au supermarché", en: "Shopping and finding things", role: "a supermarket employee stacking shelves, then a cashier", goal: "find three items, ask about a promotion, and pay at the till" },
  { id: "train", emoji: "🚆", title: "Acheter un billet de train", en: "Buy a train ticket", role: "an SNCF ticket-office agent", goal: "buy a return ticket for the weekend, ask about a youth discount card, and find the platform" },
  { id: "fuite", emoji: "🚿", title: "Un problème dans l'appart", en: "Report a leak to your landlord", role: "the learner's landlord answering the phone (a bit annoyed at first)", goal: "explain the problem, describe it, and agree on when someone will come to fix it" },
  { id: "soiree", emoji: "🎉", title: "Une soirée étudiante", en: "Chat at a student party", role: "a talkative French student at a party, using casual spoken French", goal: "chat about studies, hometowns and plans, and accept an invitation for later in the week" },
];
