import { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'verdon-planning-v1'

const DEFAULT_PARTICIPANTS = [
  'Alex',
  'Pote 2',
  'Pote 3',
  'Pote 4',
  'Pote 5',
  'Pote 6',
  'Pote 7',
  'Pote 8',
  'Pote 9',
  'Pote 10',
].map((name, i) => ({ id: `p${i + 1}`, name }))

const DEFAULT_DAYS = [
  {
    id: 'd1',
    date: '2026-06-15',
    label: 'Lun 15 juin',
    title: 'Arrivée + installation',
    departure: '',
    notes: "Journée/soirée libre, installation à la villa de Salernes.",
  },
  {
    id: 'd2',
    date: '2026-06-16',
    label: 'Mar 16 juin',
    title: 'Rando aquatique Couloir Samson',
    departure: '09:00',
    notes: "Option Lac Sainte-Croix l'après-midi (baignade / pédalo).",
  },
  {
    id: 'd3',
    date: '2026-06-17',
    label: 'Mer 17 juin',
    title: 'Sentier Blanc-Martel',
    departure: '07:00',
    notes: '14 km, ~6h de marche. Navette retour à prévoir.',
  },
  {
    id: 'd4',
    date: '2026-06-18',
    label: 'Jeu 18 juin',
    title: 'Castellane — rafting & canoë-kayak',
    departure: '08:00',
    notes: "1h15 de route depuis la villa. Action Aventure (min 4 pers/activité).",
  },
  {
    id: 'd5',
    date: '2026-06-19',
    label: 'Ven 19 juin',
    title: 'Moustiers + villages provençaux + soirée astro',
    departure: '',
    notes: 'Journée villages, télescope vers 21h30.',
  },
  {
    id: 'd6',
    date: '2026-06-20',
    label: 'Sam 20 juin',
    title: 'Tour des lacs en VAE',
    departure: '',
    notes: '~4 à 5h de vélo électrique.',
  },
  {
    id: 'd7',
    date: '2026-06-21',
    label: 'Dim 21 juin',
    title: 'Départ',
    departure: '',
    notes: 'Check-out villa, retour.',
  },
]

const DEFAULT_ACTIVITIES = [
  {
    id: 'a1',
    dayId: 'd2',
    name: 'Rando aquatique Couloir Samson',
    provider: '',
    contact: '',
    priceLabel: '45-55 €/pers (à confirmer)',
    price: 50,
    duration: 'demi-journée',
    status: 'à faire',
    toBring: "maillot, serviette, chaussures fermées qui prennent l'eau (vieilles baskets ou chaussures néoprène), crème solaire waterproof",
    options: [
      { name: 'Aboard Rafting Castellane', url: 'https://www.rafting-verdon.com/fr/', phone: '04 92 83 76 11', price: 50, priceLabel: '50€/pers', notes: 'demi-journée aqua-rando, base à 2,5 km de Castellane, à partir de ~10 ans' },
      { name: 'Raoul Rafting Verdon', url: 'https://raoulraftingverdon.com/randonnee-aquatique-canyon-du-verdon/', phone: '07 84 85 58 13', price: 50, priceLabel: '50€/pers (55€ 14/07-31/08)', notes: 'départ La Palud-sur-Verdon, Couloir Samson' },
      { name: 'Haute Provence Outdoor', url: 'https://haute-provence-outdoor.com/fr/randonnee-aquatique-verdon/grand-canyon-couloir-samson/', phone: '06 75 93 66 38', price: 50, priceLabel: '50€ basse / 65€ haute saison', notes: '3h30 total dont 1h30 dans l\'eau, dès 12 ans, sauts non obligatoires' },
      { name: 'Aloha Verdon', url: 'https://alohaverdon.com/aqua-rando/couloir-samson/', phone: '06 78 13 77 28', price: 55, priceLabel: '~55€/pers', notes: '4h total dont 1h30 dans l\'eau, dès 12 ans, savoir nager 25m' },
    ],
  },
  {
    id: 'a2',
    dayId: 'd3',
    name: 'Sentier Blanc-Martel',
    provider: 'Navette retour (rando gratuite)',
    contact: '',
    priceLabel: 'Rando gratuite. Navette ~5-9 €/pers',
    price: 9,
    duration: '14 km / ~6h',
    status: 'à faire',
    toBring: 'pique-nique complet, 2L d\'eau/pers, chaussures de rando, lampe frontale (tunnels), casquette, crème, K-way léger',
    options: [
      { name: 'Navette officielle Parc du Verdon', url: 'https://navette.parcduverdon.fr/', phone: '', price: 5, priceLabel: '4,50€ aller simple / 8,50€ AR adulte', notes: 'La Palud ↔ Chalet Maline / Point Sublime, résa en ligne fortement recommandée, saison à partir du 3 avril 2026' },
    ],
  },
  {
    id: 'a3',
    dayId: 'd4',
    name: 'Rafting Castellane',
    provider: 'Action Aventure',
    contact: '06 14 82 86 46',
    priceLabel: '45-65 €/pers',
    price: 50,
    duration: 'demi-journée',
    status: 'à faire',
    toBring: 'maillot sous les vêtements, vieilles baskets, crème solaire waterproof, lunettes avec lanière, change sec dans le coffre',
    options: [
      { name: 'Yeti Rafting Castellane', url: 'https://verdon-rafting.net/', phone: '04 86 62 13 02', price: 45, priceLabel: 'à partir de 45€/pers', notes: '12 Bd de la République 04120 Castellane, dès 7 ans, savoir nager' },
      { name: 'Action Aventure Castellane', url: 'https://www.castellane-verdon.com/commerce-service/action-aventure/', phone: '06 14 82 86 46', price: 50, priceLabel: '45-55€/pers', notes: 'seul label Qualité Tourisme en eaux vives à Castellane' },
      { name: 'Raoul Rafting Verdon', url: 'https://raoulraftingverdon.com/rafting-verdon/', phone: '07 84 85 58 13', price: 50, priceLabel: '50€ basse / 55€ 14/07-31/08', notes: 'demi-journée, bureau guides locaux Castellane' },
      { name: 'Aboard Rafting', url: 'https://www.rafting-verdon.com/fr/', phone: '04 92 83 76 11', price: 65, priceLabel: '65€/pers', notes: 'accès rivière privé, lâchers de barrage Castillon' },
    ],
  },
  {
    id: 'a4',
    dayId: 'd4',
    name: 'Canoë-kayak Castellane',
    provider: 'Action Aventure',
    contact: '06 14 82 86 46',
    priceLabel: '30-55 €/pers — min 4 pers/activité',
    price: 40,
    duration: 'demi-journée',
    status: 'à faire',
    toBring: 'maillot, vieilles baskets, crème waterproof, lunettes avec lanière',
    options: [
      { name: 'Verdon Canoë (descente découverte)', url: 'https://verdoncanoe.com/', phone: '', price: 35, priceLabel: '30-35€/pers', notes: 'parcours AR 2h30 dans le canyon, ouverture saison 4 avril 2026' },
      { name: 'Montagne & Rivière', url: 'https://rafting-castellane.fr/cano-raft-kayak-verdon/', phone: '04 92 83 67 24', price: 40, priceLabel: '~40€/pers', notes: 'Chemin des Hautes Listes Castellane, descentes 8-12 km, dès 12 ans' },
      { name: 'Yeti Rafting Castellane', url: 'https://verdon-rafting.net/', phone: '04 86 62 13 02', price: 50, priceLabel: 'à partir de 50€/pers', notes: 'encadré, demi-journée, dès 7 ans' },
      { name: 'Aboard Rafting (cano-raft)', url: 'https://www.rafting-verdon.com/fr/', phone: '04 92 83 76 11', price: 55, priceLabel: '55-65€/pers cano-raft', notes: 'hybride canoë/raft 2 places' },
    ],
  },
  {
    id: 'a5',
    dayId: 'd5',
    name: 'Soirée astro télescope',
    provider: '',
    contact: '',
    priceLabel: '20-30 €/pers',
    price: 25,
    duration: 'soirée (~21h30)',
    status: 'à faire',
    toBring: 'vêtement chaud (T° peut tomber à 12°C), couverture, frontale rouge si possible',
    options: [
      { name: 'Observatoire Mont Chiran (animation)', url: 'https://www.verdontourisme.com/informations/patrimoine-culturel/observatoire-du-mont-chiran-5496051id/', phone: '04 92 83 66 67', price: 20, priceLabel: '20€ adulte / 12€ enfant', notes: '1905 m altitude au-dessus de La Palud, télescope 305 mm, accès par rando 4h50/10,5 km — pas adapté à notre planning, ou nuitée refuge' },
      { name: 'Astro Verdon (assoc.)', url: 'https://www.astroverdon.fr/', phone: '06 62 25 58 31', price: 25, priceLabel: '25€ adulte / gratuit <15 ans', notes: 'soirées Baudinard + interventions Moustiers/Bauduen/Valensole/Aiguines, privatisation groupe (10 pers OK)' },
      { name: 'Observatoire Astronomique de Bauduen', url: 'https://www.observatoire-astronomique-de-bauduen.com/', phone: '', price: 30, priceLabel: '30€ adulte / 15€ enfant', notes: 'à 5 min du village, à 500m du lac Sainte-Croix, soirées toute l\'année avec télescope — option la plus proche de la villa' },
    ],
  },
  {
    id: 'a6',
    dayId: 'd6',
    name: 'Tour des lacs en VAE',
    provider: '',
    contact: '',
    priceLabel: '30-45 €/pers',
    price: 38,
    duration: '~4-5h',
    status: 'à faire',
    toBring: 'maillot sous la tenue (baignade), crème solaire, 2L d\'eau, lunettes, casquette légère sous le casque, gants vélo si dispo',
    options: [
      { name: 'Verdon E-Bike (La Palud)', url: 'https://www.veloloisirprovence.com/page/verdon-e-bike', phone: '', price: 30, priceLabel: 'VTC 30€/3h, VAE 45€ ½j, 70€ j', notes: '3 Rue Grande La Palud, spécialiste Route des Crêtes, espèces et chèques uniquement' },
      { name: 'Ebike Moustiers', url: 'https://ebikemoustiers.fr/', phone: '06 11 53 13 86', price: 38, priceLabel: '38€/j (20€ 2h, 70€ 2j)', notes: 'VAE Cannondale Bosch, casque + antivol + support smartphone, -12% groupes 5+, livraison <20 km, 9h-18h 7j/7' },
      { name: 'Moustiers Bike Services', url: 'https://www.moustiersbikeservices.com/', phone: '06 42 18 58 86', price: 40, priceLabel: '~35-45€/j VAE', notes: 'Domaine du Petit Lac, route des Salles Moustiers, VAE Cube Bosch, livraison 30 km' },
      { name: 'Stations Bee\'s Verdon (Quinson)', url: 'https://www.stationsbees.com/stations/stations-bee-s-quinson-verdon-04', phone: '', price: 40, priceLabel: '~40€/j VAE', notes: 'idéal boucle sud des lacs (Sainte-Croix / Quinson / Esparron) depuis Salernes' },
    ],
  },
]

const DEFAULT_RESERVATIONS = [
  { id: 'r1', label: 'Rando aquatique Couloir Samson', status: 'à faire', deadline: '2026-05-25', done: false },
  { id: 'r2', label: 'Action Aventure Castellane — rafting + canoë (06 14 82 86 46)', status: 'à faire', deadline: '2026-05-25', done: false },
  { id: 'r3', label: 'Navette retour Blanc-Martel', status: 'à faire', deadline: '2026-06-01', done: false },
  { id: 'r4', label: 'Soirée astro télescope', status: 'à faire', deadline: '2026-06-01', done: false },
  { id: 'r5', label: 'Tour des lacs en VAE', status: 'à faire', deadline: '2026-05-25', done: false },
]

const DEFAULT_STATE = {
  participants: DEFAULT_PARTICIPANTS,
  days: DEFAULT_DAYS,
  activities: DEFAULT_ACTIVITIES,
  participation: {},
  reservations: DEFAULT_RESERVATIONS,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    const merged = { ...DEFAULT_STATE, ...parsed }
    // Toujours réinjecter les `options` (système, pas user-editable) depuis le défaut.
    merged.activities = (merged.activities || []).map(a => {
      const def = DEFAULT_ACTIVITIES.find(d => d.id === a.id)
      return def ? { ...a, options: def.options } : a
    })
    return merged
  } catch {
    return DEFAULT_STATE
  }
}

const STATUS_STYLES = {
  'à faire': 'bg-rose-100 text-rose-800 border-rose-200',
  'en attente': 'bg-amber-100 text-amber-800 border-amber-200',
  'confirmé': 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_OPTIONS = ['à faire', 'en attente', 'confirmé']

const TABS = [
  { id: 'programme', label: 'Programme' },
  { id: 'planning', label: 'Planning' },
  { id: 'activites', label: 'Activités' },
  { id: 'participants', label: 'Participants' },
  { id: 'budget', label: 'Budget' },
  { id: 'checklist', label: 'Check-list résas' },
]

const PROGRAMME = [
  {
    dayId: 'd1',
    title: 'Lun 15 juin — Arrivée & installation',
    summary: "Journée tranquille : check-in villa, courses, apéro de bienvenue.",
    travel: [
      { from: 'Selon départ de chacun', to: 'Villa Salernes', km: '', mn: '' },
    ],
    timeline: [
      { t: '16:00', what: "Check-in villa, attribution des chambres" },
      { t: '17:00', what: "Courses : Petit Casino Salernes (dépannage), sinon Casino Cotignac (15 min) ou Hyper U Saint-Maximin (35 min) pour le gros du séjour" },
      { t: '19:30', what: "Apéro au bord de la piscine + briefing semaine, on cale qui fait quoi (cf. onglet Participants)" },
      { t: '21:00', what: "Pizza au feu de bois villa ou resto Salernes" },
    ],
    bring: 'Kit "premier soir" : PQ, sel, huile, café, sopalin, sacs poubelle (les locations n\'en laissent souvent qu\'un rouleau). Adaptateur prises si potes étrangers.',
    tips: "Briefer la semaine et faire signer les inscriptions activités ce soir-là — Action Aventure demande min 4 pers/activité, donc verrouille les inscriptions avant mercredi.",
  },
  {
    dayId: 'd2',
    title: 'Mar 16 juin — Aqua-rando Couloir Samson + (option) Lac Sainte-Croix',
    summary: "Matinée canyoning encadré dans le Couloir Samson, après-midi baignade plage de Bauduen.",
    travel: [
      { from: 'Villa Salernes', to: 'La Palud-sur-Verdon (rdv prestataire)', km: '70 km', mn: '~1h15' },
      { from: 'La Palud', to: 'Bauduen (plage lac Sainte-Croix)', km: '30 km', mn: '~45 min' },
      { from: 'Bauduen', to: 'Villa Salernes', km: '30 km', mn: '~40 min' },
    ],
    timeline: [
      { t: '08:00', what: 'Petit-déj villa' },
      { t: '09:00', what: 'Départ villa (2-3 voitures)' },
      { t: '10:15', what: 'Arrivée La Palud, RDV prestataire, équipement néoprène' },
      { t: '10:30', what: 'Début aqua-rando Couloir Samson (~3h30, dont 1h30 dans l\'eau)' },
      { t: '14:00', what: 'Pique-nique ou snack à La Palud' },
      { t: '15:30', what: 'Route vers Bauduen' },
      { t: '16:00', what: 'Baignade / pédalo / paddle plage de Bauduen' },
      { t: '18:30', what: 'Retour villa, apéro' },
    ],
    bring: 'Maillot SOUS les vêtements, serviette + change sec dans le coffre, chaussures fermées qui prennent l\'eau (vieilles baskets ou chaussons néoprène), crème solaire waterproof, casquette, lunettes avec lanière, lunchbox, 1,5L d\'eau/pers.',
    tips: "Niveau modéré, sauts non obligatoires. Savoir nager 25m exigé chez la plupart des prestataires. Minimum 12 ans. Réserver au moins 1 semaine à l'avance.",
  },
  {
    dayId: 'd3',
    title: 'Mer 17 juin — Sentier Blanc-Martel',
    summary: "La rando culte du Verdon : 14 km, 6-7h, 4 tunnels, paysages dingues. Logistique navette obligatoire.",
    travel: [
      { from: 'Villa Salernes', to: 'Parking Chalet de la Maline (point de départ)', km: '85 km', mn: '~1h30' },
      { from: 'Point Sublime (arrivée rando)', to: 'La Palud (parking navette)', km: '', mn: 'navette officielle ~25 min' },
      { from: 'La Palud', to: 'Villa Salernes', km: '70 km', mn: '~1h15' },
    ],
    timeline: [
      { t: '06:30', what: 'Petit-déj rapide villa, sandwichs préparés la veille' },
      { t: '07:00', what: 'Départ villa' },
      { t: '08:30', what: 'Arrivée parking Chalet de la Maline, derniers ajustements' },
      { t: '08:45', what: 'Top départ rando Blanc-Martel (14 km, dénivelé +250m / -650m)' },
      { t: '12:30', what: 'Pause déjeuner en cours de sentier (pas d\'eau potable sur le parcours)' },
      { t: '15:30', what: 'Arrivée Point Sublime' },
      { t: '15:45', what: 'Navette Point Sublime → La Palud (résa préalable obligatoire, ~5€)' },
      { t: '16:15', what: 'Récupération des voitures à La Palud' },
      { t: '17:30', what: 'Retour villa, douche, apéro' },
    ],
    bring: 'Pique-nique complet (sandwichs + barres + fruits), 2L d\'eau/pers MINIMUM (aucun ravitaillement possible), chaussures de rando à tige basse OK mais semelles crantées obligatoires, lampe frontale (4 tunnels dont 1 de 670m), casquette, crème solaire, K-way léger, bâtons de rando si dispo, mouchoirs / petit kit pharmacie.',
    tips: "Départ tôt indispensable : dernière navette ~17h. Sens classique Chalet Maline → Point Sublime (moins de dénivelé positif). Mollets et genoux mis à mal — éviter ce jour pour les moins sportifs, prévoir option B (Moustiers + lac).",
  },
  {
    dayId: 'd4',
    title: 'Jeu 18 juin — Castellane : rafting + canoë-kayak',
    summary: "Journée eaux vives à Castellane. Rafting le matin, canoë l'aprèm pour ceux qui en veulent. Possibilité de faire l'un OU l'autre.",
    travel: [
      { from: 'Villa Salernes', to: 'Castellane (base prestataire)', km: '90 km', mn: '~1h15' },
      { from: 'Castellane', to: 'Villa Salernes', km: '90 km', mn: '~1h15' },
    ],
    timeline: [
      { t: '07:30', what: 'Petit-déj villa' },
      { t: '08:00', what: 'Départ villa' },
      { t: '09:15', what: 'Arrivée Castellane, café place Marcel Sauvaire' },
      { t: '09:30', what: 'RDV prestataire (Action Aventure / Yeti / Aboard…), brief sécurité, équipement combi+casque' },
      { t: '10:00', what: 'Rafting Verdon (descente ~2h30 sur l\'eau)' },
      { t: '12:45', what: 'Retour base, change sec' },
      { t: '13:00', what: 'Déjeuner Castellane (resto place Marcel Sauvaire ou pique-nique au bord du Verdon)' },
      { t: '14:30', what: 'Canoë-kayak / cano-raft (ceux qui en veulent) — autres : balade Castellane, montée chapelle ND du Roc (30 min, vue dingue)' },
      { t: '17:00', what: 'Restitution matériel, retour villa' },
      { t: '18:30', what: 'Villa, douche, BBQ ou resto' },
    ],
    bring: 'Maillot SOUS les vêtements, vieilles baskets à crampons (rocher glissant), crème solaire waterproof, lunettes de soleil avec lanière (lunettes simples partent au premier rapide), serviette + change sec dans le coffre, lunchbox + en-cas, 1,5L eau.',
    tips: "Action Aventure exige minimum 4 pers/activité. Vérifier en avance qui fait quoi (Participants). Quelqu'un peut faire UNIQUEMENT le kayak sans le rafting — chaque activité a sa propre case à cocher.",
  },
  {
    dayId: 'd5',
    title: 'Ven 19 juin — Villages provençaux + soirée astro',
    summary: "Journée lente : Moustiers + lac, puis grosse soirée astro à Bauduen ou Baudinard.",
    travel: [
      { from: 'Villa Salernes', to: 'Moustiers-Sainte-Marie', km: '50 km', mn: '~50 min' },
      { from: 'Moustiers', to: 'Sainte-Croix-du-Verdon (plage)', km: '15 km', mn: '~25 min' },
      { from: 'Plage', to: 'Villa Salernes', km: '35 km', mn: '~45 min' },
      { from: 'Villa', to: 'Site astro (Bauduen ou Baudinard)', km: '~30 km', mn: '~40 min' },
    ],
    timeline: [
      { t: '10:00', what: 'Départ tranquille villa' },
      { t: '10:50', what: 'Moustiers-Sainte-Marie : flânerie, faïenceries, étoile de Bram' },
      { t: '11:30', what: 'Sentier chapelle Notre-Dame de Beauvoir (montée 30 min, vue plongeante)' },
      { t: '12:30', what: 'Déjeuner Moustiers (Treille Muscate, La Bonne Auberge…)' },
      { t: '14:30', what: 'Plage Sainte-Croix-du-Verdon ou Sainte-Croix sur le bord du lac : baignade, paddle' },
      { t: '17:00', what: 'Retour villa, douche, dîner' },
      { t: '20:30', what: 'Départ vers site astro' },
      { t: '21:30', what: 'Début observation télescope (Astro Verdon ou Bauduen, ~2h)' },
      { t: '00:00', what: 'Retour villa' },
    ],
    bring: 'Journée : chaussures fermées pour la chapelle (250m de montée pavée), maillot pour le lac, crème, lunettes. Soir : sweat + polaire + écharpe (T° peut tomber à 12°C en altitude), couverture pour s\'allonger, frontale rouge si dispo (préserve la vision nocturne).',
    tips: "Mont Chiran (1905m) = animation la moins chère MAIS accès rando 4h50 ou route 4x4 — pas réaliste à 10 sur une soirée. Privilégier Astro Verdon à Baudinard (25€) ou Observatoire de Bauduen (30€), les deux à 30-40 min de la villa. Réserver à l'avance, capacités limitées en soirée.",
  },
  {
    dayId: 'd6',
    title: 'Sam 20 juin — Tour des lacs en VAE',
    summary: "Boucle VAE depuis Moustiers : tour des plages du lac Sainte-Croix, baignade en cours de route.",
    travel: [
      { from: 'Villa Salernes', to: 'Loueur Moustiers / La Palud', km: '50 km', mn: '~50 min' },
      { from: 'Moustiers', to: 'Sainte-Croix-du-Verdon (boucle)', km: '8 km', mn: 'VAE ~30 min' },
      { from: 'Sainte-Croix', to: 'Bauduen', km: '12 km', mn: 'VAE ~45 min' },
      { from: 'Bauduen', to: 'Retour Moustiers', km: '20 km', mn: 'VAE ~1h15' },
    ],
    timeline: [
      { t: '09:00', what: 'Petit-déj villa' },
      { t: '09:30', what: 'Départ villa' },
      { t: '10:20', what: 'Arrivée loueur (Ebike Moustiers / Verdon E-Bike La Palud), récupération vélos, brief' },
      { t: '11:00', what: 'Top départ tour des lacs' },
      { t: '12:30', what: 'Sainte-Croix-du-Verdon : pause + baignade' },
      { t: '13:30', what: 'Reprise vers Bauduen, déjeuner pique-nique ou snack plage de Bauduen' },
      { t: '15:00', what: 'Retour Moustiers par la rive opposée' },
      { t: '16:30', what: 'Restitution vélos' },
      { t: '17:30', what: 'Retour villa' },
      { t: '20:00', what: 'Dîner resto Salernes ou Cotignac (dernier soir, réserver à l\'avance)' },
    ],
    bring: 'Tenue souple ou cycliste, maillot SOUS la tenue (baignade obligatoire vu la chaleur), crème solaire, 2L d\'eau/pers, lunettes de soleil, casquette légère sous le casque, gants vélo si dispo, kit minimal (téléphone, CB, snacks), petite serviette microfibre.',
    tips: "Si fatigue post-semaine : alternative location demi-journée (20€ les 2h chez Ebike Moustiers) + plus de temps baignade. -12% groupes 5+ chez Ebike Moustiers — penser à le négocier au moment de la résa pour 10 pers.",
  },
  {
    dayId: 'd7',
    title: 'Dim 21 juin — Départ',
    summary: "Check-out tranquille, départs échelonnés selon vols/trains.",
    travel: [
      { from: 'Villa Salernes', to: 'Selon départ', km: '', mn: '' },
    ],
    timeline: [
      { t: '09:00', what: 'Petit-déj' },
      { t: '10:00', what: 'Ménage villa (répartition à faire à l\'arrivée), regroupement des poubelles' },
      { t: '11:00', what: 'Check-out, photo de groupe' },
      { t: '12:00', what: 'Départs' },
    ],
    bring: '',
    tips: 'Prévoir une caisse commune pendant la semaine pour les courses + essence — ça simplifie le règlement final. Le récap budget par personne (onglet Budget) est calculé en € par activité ; ajouter à la main les courses, essence, restos.',
  },
]

const DISTANCES = [
  { to: 'La Palud-sur-Verdon', km: 70, mn: '~1h15', why: 'Aqua-rando Couloir Samson, point de départ Sentier Blanc-Martel, loueur VAE' },
  { to: 'Castellane', km: 90, mn: '~1h15', why: 'Rafting + canoë-kayak (Action Aventure et autres)' },
  { to: 'Point Sublime', km: 75, mn: '~1h25', why: 'Arrivée du Sentier Blanc-Martel' },
  { to: 'Moustiers-Sainte-Marie', km: 50, mn: '~50 min', why: 'Village classé, chapelle, loueurs VAE, faïenceries' },
  { to: 'Bauduen (lac Sainte-Croix)', km: 30, mn: '~40 min', why: 'Plage la plus proche, Observatoire Astro' },
  { to: 'Aiguines', km: 40, mn: '~45 min', why: 'Balcons du Verdon, vue plongeante sur le lac' },
  { to: 'Sainte-Croix-du-Verdon', km: 35, mn: '~45 min', why: 'Plage rive sud, paddle, pédalo' },
  { to: 'Baudinard-sur-Verdon', km: 25, mn: '~35 min', why: 'Astro Verdon (assoc.)' },
]

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500'

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  )
}

function PlanningTab({ state, setState }) {
  const updateDay = (id, patch) => {
    setState(s => ({
      ...s,
      days: s.days.map(d => d.id === id ? { ...d, ...patch } : d),
    }))
  }
  const activitiesByDay = useMemo(() => {
    const map = {}
    state.activities.forEach(a => {
      if (!map[a.dayId]) map[a.dayId] = []
      map[a.dayId].push(a)
    })
    return map
  }, [state.activities])

  return (
    <div className="space-y-4">
      {state.days.map(day => (
        <div key={day.id} className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            <span className="text-sm font-semibold text-sky-700">{day.label}</span>
            <span className="text-xs text-slate-400">{day.date}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2">
              <Field label="Titre de la journée">
                <input
                  className={inputCls}
                  value={day.title}
                  onChange={e => updateDay(day.id, { title: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Départ villa">
              <input
                type="time"
                className={inputCls}
                value={day.departure}
                onChange={e => updateDay(day.id, { departure: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              rows={2}
              className={inputCls}
              value={day.notes}
              onChange={e => updateDay(day.id, { notes: e.target.value })}
            />
          </Field>
          {(activitiesByDay[day.id] || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activitiesByDay[day.id].map(a => (
                <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                  <span>{a.name}</span>
                  <StatusBadge status={a.status} />
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ActivitiesTab({ state, setState }) {
  const updateActivity = (id, patch) => {
    setState(s => ({
      ...s,
      activities: s.activities.map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {state.activities.map(a => {
        const day = state.days.find(d => d.id === a.dayId)
        return (
          <div key={a.id} className="rounded-xl bg-white shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <input
                className="text-base font-semibold w-full bg-transparent border-b border-transparent focus:border-sky-300 focus:outline-none"
                value={a.name}
                onChange={e => updateActivity(a.id, { name: e.target.value })}
              />
              <StatusBadge status={a.status} />
            </div>
            {day && <div className="text-xs text-slate-400">{day.label} — {day.title}</div>}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prestataire">
                <input
                  className={inputCls}
                  value={a.provider}
                  onChange={e => updateActivity(a.id, { provider: e.target.value })}
                />
              </Field>
              <Field label="Contact tél">
                <input
                  className={inputCls}
                  value={a.contact}
                  onChange={e => updateActivity(a.id, { contact: e.target.value })}
                />
              </Field>
              <Field label="Prix/pers (libellé)">
                <input
                  className={inputCls}
                  value={a.priceLabel}
                  onChange={e => updateActivity(a.id, { priceLabel: e.target.value })}
                />
              </Field>
              <Field label="Prix budget (€/pers)">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={a.price}
                  onChange={e => updateActivity(a.id, { price: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Durée">
                <input
                  className={inputCls}
                  value={a.duration}
                  onChange={e => updateActivity(a.id, { duration: e.target.value })}
                />
              </Field>
              <Field label="Statut résa">
                <select
                  className={inputCls}
                  value={a.status}
                  onChange={e => updateActivity(a.id, { status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Field label="À prévoir">
              <textarea
                rows={2}
                className={inputCls}
                value={a.toBring}
                onChange={e => updateActivity(a.id, { toBring: e.target.value })}
              />
            </Field>

            {a.options && a.options.length > 0 && (
              <div className="mt-2 border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  Prestataires possibles ({a.options.length}) — triés par prix
                </div>
                <div className="space-y-2">
                  {[...a.options].sort((x, y) => x.price - y.price).map((o, i) => (
                    <div key={i} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sky-700 hover:text-sky-900 underline-offset-2 hover:underline"
                        >
                          {o.name} ↗
                        </a>
                        <span className="font-semibold text-emerald-700 whitespace-nowrap">{o.priceLabel}</span>
                      </div>
                      {(o.phone || o.notes) && (
                        <div className="mt-1 text-slate-600 leading-snug">
                          {o.phone && <span className="inline-block mr-2"><span className="text-slate-400">tél</span> {o.phone}</span>}
                          {o.notes && <span>{o.notes}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ParticipantsTab({ state, setState }) {
  const updateParticipant = (id, name) => {
    setState(s => ({
      ...s,
      participants: s.participants.map(p => p.id === id ? { ...p, name } : p),
    }))
  }
  const toggleParticipation = (activityId, participantId) => {
    setState(s => {
      const current = s.participation[activityId] || {}
      const next = { ...current, [participantId]: !current[participantId] }
      return {
        ...s,
        participation: { ...s.participation, [activityId]: next },
      }
    })
  }
  const countFor = (activityId) => {
    const m = state.participation[activityId] || {}
    return Object.values(m).filter(Boolean).length
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Les 10 participants</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {state.participants.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}.</span>
              <input
                className={inputCls}
                value={p.name}
                onChange={e => updateParticipant(p.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {state.activities.map(a => {
          const day = state.days.find(d => d.id === a.dayId)
          const count = countFor(a.id)
          return (
            <div key={a.id} className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  {day && <div className="text-xs text-slate-400">{day.label}</div>}
                </div>
                <div className="text-sm font-medium text-sky-700">
                  {count} / {state.participants.length} participants
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {state.participants.map(p => {
                  const checked = !!(state.participation[a.id] && state.participation[a.id][p.id])
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer text-sm transition ${
                        checked ? 'bg-sky-50 border-sky-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-sky-600"
                        checked={checked}
                        onChange={() => toggleParticipation(a.id, p.id)}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-xs text-slate-500">
        Note : pour Castellane, rafting et canoë-kayak sont deux activités séparées —
        chacun peut cocher l'une, l'autre, les deux, ou aucune.
      </div>
    </div>
  )
}

function BudgetTab({ state }) {
  const perParticipant = useMemo(() => {
    const map = {}
    state.participants.forEach(p => {
      let total = 0
      state.activities.forEach(a => {
        if (state.participation[a.id]?.[p.id]) total += Number(a.price) || 0
      })
      map[p.id] = total
    })
    return map
  }, [state])

  const groupTotal = Object.values(perParticipant).reduce((s, v) => s + v, 0)
  const activityTotals = state.activities.map(a => {
    const count = Object.values(state.participation[a.id] || {}).filter(Boolean).length
    return { a, count, subtotal: count * (Number(a.price) || 0) }
  })

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Coût groupe estimé</div>
          <div className="text-2xl font-bold mt-1">{groupTotal.toLocaleString('fr-FR')} €</div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Coût moyen / pers</div>
          <div className="text-2xl font-bold mt-1">
            {Math.round(groupTotal / Math.max(1, state.participants.length)).toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Activités encadrées</div>
          <div className="text-2xl font-bold mt-1">{state.activities.length}</div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold">
          Coût par participant
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left px-3 py-2 sticky left-0 bg-slate-50 z-10">Participant</th>
                {state.activities.map(a => (
                  <th key={a.id} className="text-center px-2 py-2 whitespace-nowrap">
                    {a.name}
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                      {a.price}€
                    </div>
                  </th>
                ))}
                <th className="text-right px-3 py-2 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {state.participants.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium sticky left-0 bg-white">{p.name}</td>
                  {state.activities.map(a => {
                    const on = !!state.participation[a.id]?.[p.id]
                    return (
                      <td key={a.id} className="text-center px-2 py-2">
                        {on ? <span className="text-sky-700">{a.price}€</span> : <span className="text-slate-300">—</span>}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-right font-semibold">
                    {perParticipant[p.id].toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td className="px-3 py-2 font-semibold sticky left-0 bg-slate-50">Total activité</td>
                {activityTotals.map(({ a, count, subtotal }) => (
                  <td key={a.id} className="text-center px-2 py-2 text-xs">
                    <div className="text-slate-500">{count} pers</div>
                    <div className="font-semibold">{subtotal}€</div>
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold">
                  {groupTotal.toLocaleString('fr-FR')} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Les prix sont des estimations (« à confirmer ») jusqu'à validation par les prestataires.
        Modifie la valeur « Prix budget » dans l'onglet Activités pour recalculer.
      </div>
    </div>
  )
}

function ChecklistTab({ state, setState }) {
  const updateRes = (id, patch) => {
    setState(s => ({
      ...s,
      reservations: s.reservations.map(r => r.id === id ? { ...r, ...patch } : r),
    }))
  }
  const addRes = () => {
    const id = `r${Date.now()}`
    setState(s => ({
      ...s,
      reservations: [...s.reservations, { id, label: 'Nouvelle réservation', status: 'à faire', deadline: '', done: false }],
    }))
  }
  const removeRes = (id) => {
    setState(s => ({ ...s, reservations: s.reservations.filter(r => r.id !== id) }))
  }

  const sorted = [...state.reservations].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (a.deadline || '').localeCompare(b.deadline || '')
  })

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-700">Réservations à passer</h2>
        <button
          onClick={addRes}
          className="rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm px-3 py-1.5"
        >
          + Ajouter
        </button>
      </div>
      {sorted.map(r => (
        <div
          key={r.id}
          className={`rounded-xl bg-white shadow-sm border p-3 flex flex-wrap items-center gap-3 ${
            r.done ? 'border-emerald-200 opacity-60' : 'border-slate-200'
          }`}
        >
          <input
            type="checkbox"
            className="w-5 h-5 accent-emerald-600"
            checked={r.done}
            onChange={e => updateRes(r.id, { done: e.target.checked, status: e.target.checked ? 'confirmé' : r.status })}
          />
          <input
            className={`flex-1 min-w-[200px] bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-sky-300 ${r.done ? 'line-through text-slate-500' : ''}`}
            value={r.label}
            onChange={e => updateRes(r.id, { label: e.target.value })}
          />
          <input
            type="date"
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            value={r.deadline}
            onChange={e => updateRes(r.id, { deadline: e.target.value })}
          />
          <select
            className={`rounded-md border px-2 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
            value={r.status}
            onChange={e => updateRes(r.id, { status: e.target.value, done: e.target.value === 'confirmé' })}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => updateRes(r.id, { done: true, status: 'confirmé' })}
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 disabled:opacity-40"
            disabled={r.done}
          >
            Marquer fait
          </button>
          <button
            onClick={() => removeRes(r.id)}
            className="text-slate-400 hover:text-rose-600 text-xs"
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

function ProgrammeTab({ state }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 p-4">
        <h2 className="text-base font-bold text-slate-800">Programme proposé — Verdon 15-21 juin 2026</h2>
        <p className="text-sm text-slate-600 mt-1">
          Base : villa à Salernes (Var). 10 potes. Itinéraire optimisé pour minimiser les trajets et grouper les activités proches.
          Tout est éditable depuis les autres onglets — ce programme est la version curée de référence.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Distances clés depuis Salernes</h3>
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {DISTANCES.map((d, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-slate-100 pb-1">
              <div>
                <span className="font-medium">{d.to}</span>
                <span className="text-xs text-slate-500 ml-2">{d.why}</span>
              </div>
              <span className="text-xs font-semibold text-sky-700 whitespace-nowrap">{d.km} km · {d.mn}</span>
            </div>
          ))}
        </div>
      </div>

      {PROGRAMME.map((p, idx) => {
        const day = state.days.find(d => d.id === p.dayId)
        return (
          <div key={p.dayId} className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-sky-700 font-semibold">Jour {idx + 1}</div>
                <div className="font-bold text-slate-800">{p.title}</div>
              </div>
              {day && <div className="text-xs text-slate-400">{day.date}</div>}
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{p.summary}</p>

              {p.travel && p.travel.length > 0 && p.travel[0].km && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1.5">🚗 Trajets</div>
                  <div className="space-y-1">
                    {p.travel.map((t, i) => (
                      <div key={i} className="text-xs flex flex-wrap items-baseline gap-x-2 text-slate-600">
                        <span className="text-slate-800">{t.from}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-800">{t.to}</span>
                        {(t.km || t.mn) && (
                          <span className="ml-auto font-semibold text-sky-700">
                            {t.km}{t.km && t.mn ? ' · ' : ''}{t.mn}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1.5">🕐 Timeline</div>
                <div className="space-y-1.5">
                  {p.timeline.map((line, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="font-mono font-semibold text-sky-700 w-12 shrink-0">{line.t}</span>
                      <span className="text-slate-700 leading-snug">{line.what}</span>
                    </div>
                  ))}
                </div>
              </div>

              {p.bring && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="text-xs font-semibold text-amber-900 mb-1">🎒 À prévoir</div>
                  <p className="text-xs text-amber-900 leading-relaxed">{p.bring}</p>
                </div>
              )}

              {p.tips && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                  <div className="text-xs font-semibold text-emerald-900 mb-1">💡 Astuce / vigilance</div>
                  <p className="text-xs text-emerald-900 leading-relaxed">{p.tips}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('programme')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const resetAll = () => {
    if (confirm('Tout réinitialiser aux valeurs par défaut ?')) {
      setState(DEFAULT_STATE)
    }
  }

  return (
    <div className="min-h-full">
      <header className="bg-gradient-to-r from-sky-700 to-emerald-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Séjour Verdon — 15-21 juin 2026</h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-0.5">Villa à Salernes · 10 participants · Gorges du Verdon / Castellane</p>
          </div>
          <button
            onClick={resetAll}
            className="text-[11px] uppercase tracking-wide text-sky-100 hover:text-white underline underline-offset-2"
          >
            Réinitialiser
          </button>
        </div>
      </header>

      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-2 flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.id
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5">
        {tab === 'programme' && <ProgrammeTab state={state} />}
        {tab === 'planning' && <PlanningTab state={state} setState={setState} />}
        {tab === 'activites' && <ActivitiesTab state={state} setState={setState} />}
        {tab === 'participants' && <ParticipantsTab state={state} setState={setState} />}
        {tab === 'budget' && <BudgetTab state={state} />}
        {tab === 'checklist' && <ChecklistTab state={state} setState={setState} />}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
        Données stockées localement (localStorage). Aucun serveur.
      </footer>
    </div>
  )
}
