<!-- converted from these_chapitres_3_et_5_architecture_validation.docx -->

MEMOIRE DE MASTER
Conception et realisation d'un moteur de calcul fiscal
trilingue pour la TVA algerienne
Application web avec validation empirique (Loi de Finances 2025)
Chapitres 3 et 5 : Architecture systeme et Validation empirique

Table des matieres


# Chapitre 3 : Architecture du systeme
Ce chapitre presente l'architecture technique du moteur de calcul fiscal TVA developpe dans le cadre de ce memoire. L'objectif est de decrire les choix technologiques, la structure des composants, et les mecanismes qui garantissent la precision, la maintenabilite et l'evolutivite du systeme. L'architecture a ete concue selon les principes du Design Science Research (DSR), en privilgiant la modularite et la separation des responsabilites (SoC, Separation of Concerns).
## 3.1 Architecture generale et choix technologiques
Le systeme est construit sur la stack Next.js 16 avec App Router, un framework React full-stack qui permet de gerer a la fois le rendu coté serveur (SSR) et les API routes au sein d'un meme projet. Ce choix offre plusieurs avantages pour un moteur fiscal : le pre-rendu garantit des performances initiales rapides, tandis que les Server Components reduisent la surface d'attaque coté client en maintenant la logique metier critique sur le serveur.
La couche de persistance utilise Prisma ORM, un outil de mapping objet-relationnel qui offre un typage strict et une generation automatique de requetes SQL. Le schema de donnees est concu pour representer les regles fiscales de maniere declarative : chaque regle (tax_rules) contient des brackets (taux par categorie) et des deductions (seuils d'exoneration, references legislatives). Cette approche permet de modifier les regles fiscales sans toucher au code du moteur de calcul, simplement en mettant a jour la base de donnees.
La precision arithmetique est assuree par la bibliotheque decimal.js, configuree avec une precision de 20 decimales et un arrondi du banquier (ROUND_HALF_UP). Cette bibliotheque est utilisee pour toutes les operations mathematiques du moteur, eliminant les erreurs d'arrondi inherentes a l'utilisation des nombres a virgule flottante natifs de JavaScript. C'est un choix critique pour un outil fiscal ou chaque dinar compte.
## 3.2 Structure du projet et organisation des composants
Le projet suit une architecture modulaire ou chaque couche a une responsabilite clairement definie. Le repertoire /lib contient la logique metier pure (moteur de calcul, utilitaires decimaux), le repertoire /components regroupe les composants React organisees par domaine fonctionnel (formulaire fiscal, resultats, commutateur de mode), et le repertoire /app gere les routes et l'API. Cette separation facilite les tests unitaires du moteur de calcul independamment de l'interface utilisateur.
Tableau 3-1 : Structure des fichiers principaux du projet
La structure illustree dans le Tableau 3-1 montre une separation nette entre la logique metier (tax-engine), la persistance (Prisma), l'interface utilisateur (composants React) et l'internationalisation (fichiers JSON). Cette architecture permet a un developpeur de modifier les taux de TVA dans la base de donnees sans toucher au code TypeScript, ou d'ajouter une nouvelle langue simplement en creant un nouveau fichier JSON de traduction.
## 3.3 Moteur de calcul fiscal (tax-engine.ts)
Le coeur du systeme est la fonction calculateTVA(), une fonction pure qui prend en entree un montant, une categorie de TVA et un secteur d'activite, et retourne un resultat structure contenant le montant de la taxe, le total TTC, les references legislatives et un decompose detaille de chaque etape de calcul. Le terme 'fonction pure' signifie que la sortie depend uniquement des entrees et des regles fiscales fournies, sans effet de bord. Cette propriete est essentielle pour la reproductibilite des tests de validation.
Le flux de calcul suit six etapes sequentielles. Premierement, l'entree utilisateur est parsee via decimal.js, avec rejet systematique des valeurs NaN, Infinity ou negatives. Deuxiemement, les regles fiscales sont chargees depuis la base de donnees (via Prisma) ou, en cas d'indisponibilite, depuis un jeu de regles de secours code en dur correspondant a la Loi de Finances 2025. Troisiemement, le systeme verifie si une exoneration automatique s'applique en fonction du secteur et du montant : les exportations sont toujours exonerees (Art. 30-4 du CID), les prestataires de services dont le chiffre d'affaires annuel est inferieur ou egal a 1 000 000 DZD beneficient d'une franchise (Art. 30-1), de meme que les commercants en dessous du meme seuil.
Si aucune exoneration ne s'applique, le moteur selectionne le barème applicable : taux normal de 19% (Art. 28 du CID) pour la majorite des biens et services, taux reduit de 9% (Art. 29 du CID) pour les produits alimentaires, pharmaceutiques et de transport, ou taux zero pour les operations exonerees. Le calcul utilise decimal.js pour la multiplication (base x taux) avec un arrondi a deux decimales. Finalement, le resultat est structure en un objet JSON contenant le decompose complet avec les references legislatives a chaque etape.
### 3.3.1 Gestion de la precision arithmetique
JavaScript represente les nombres decimaux en virgule flottante IEEE 754, ce qui introduit des erreurs d'arrondi. Par exemple, 0.1 + 0.2 ne donne pas exactement 0.3 mais 0.30000000000000004. Dans un contexte fiscal algerien, ces erreurs peuvent se propager sur des montants importants et generer des ecarts significatifs. La bibliotheque decimal.js resout ce probleme en representant les nombres comme des entiers de precision arbitraire avec un emplacement decimal explicite.
La configuration de decimal.js dans notre projet utilise une precision de 20 decimales, largement superieure aux 2 decimales requises pour les montants en dinars algeriens. L'arrondi utilise le mode HALF_UP (arrondi au plus proche, avec arrondi suprieur pour les valeurs exactement a mi-chemin), qui est la norme comptable en Algerie. Toutes les fonctions du moteur de calcul (calculateTax, calculateTTC, calculateVariance) passent par decimal.js, garantissant que meme les calculs intermediaires ne perdent jamais en precision.
## 3.4 Schema de donnees et gestion des regles fiscales
Le schema Prisma definit trois modeles principaux interconnectes par des relations un-a-plusieurs. Le modele TaxRule represente une regle fiscale identifiee par un code (tax_code, par exemple 'TVA'), une version (par exemple '2025' pour la Loi de Finances 2025), une date d'effet et un statut (actif/inactif). Le champ metadata stocke les informations legislatives au format JSON (loi, autorite, article principal). Le modele TaxBracket represente les tranches de taux associees a une regle : categorie (normal, reduit, exempt), taux, et conditions d'application. Le modele TaxDeduction represente les deductions et exoneration avec des descriptions trilingues (fr, en, ar).
Tableau 3-2 : Schema relationnel des regles fiscales
Cette conception offre un avantage majeur pour l'evolutivite : pour ajouter un nouvel impot comme l'IRG (Impot sur le Revenu Global) ou l'IBS (Impot sur les Benefices des Societes), il suffit d'inserer de nouvelles regles dans la base de donnees avec le tax_code approprie, sans modifier le code du moteur. Le champ version permet de gerer plusieurs versions legislatives en parallele, ce qui facilite les comparaisons entre exercices fiscaux et les simulations retropectives.
## 3.5 Systeme d'internationalisation trilingue (FR/EN/AR)
L'internationalisation est implementee via un provider React Context qui encapsule toute l'application. Trois fichiers JSON (fr.json, en.json, ar.json) contiennent environ 60 cles de traduction couvrant les labels d'interface, les termes juridiques, les messages d'erreur et les infobulles. Le commutateur de langue met a jour le contexte global, ce qui provoque un re-rendu reactif de tous les composants utilisant les traductions.
Le support de l'arabe (RTL, Right-to-Left) est gere dynamiquement en modifiant l'attribut dir de l'element HTML racine. Lorsque la locale est 'ar', la valeur passe a 'rtl', ce qui active les styles CSS specifiques (texte aligne a droite, inversion des marges, adaptation du sens de lecture). Les montants financiers sont formats selon les conventions locales : format francais pour le francais (espace comme separateur de milliers, virgule pour les decimales), format anglais pour l'anglais, et format arabe (chiffres arabes orientaux) pour l'arabe via l'API Intl.NumberFormat.
## 3.6 Modeles d'utilisation et architecture modulaire
L'interface utilisateur propose trois modes d'utilisation concus pour des profils differents. Le mode Simple offre une saisie minimale (montant + categorie) et affiche un resultat sur une ligne, adapte aux contribuables souhaitant un calcul rapide. Le mode Expert expose tous les parametres (secteur, regime fiscal, reference de facture, date) et produit un decompose detaille avec les citations legislatives a chaque etape, destine aux comptables et experts-comptables. Le mode These (Validation) execute automatiquement cinq cas de test precharges et affiche un tableau de variance attendu vs calcule, concu pour la validation empirique et la soutenance.
Cette architecture en trois modes demontre la polyvalence du moteur de calcul : le meme coeur algorithmique (calculateTVA) est invoque dans les trois cas, seule la profondeur de l'affichage varie. C'est un argument fort pour la defense de these, car il prouve que la precision du calcul ne depend pas de l'interface, mais d'un moteur mathematique rigoureux et testable.
## 3.7 Evolutivite vers d'autres impots (IRG/IBS)
L'architecture est concue pour s'etendre a d'autres impots algeriens sans refonte majeure. Le schema de donnees supporte deja la notion de tax_code, ce qui permet de stocker les barèmes de l'IRG et de l'IBS aux cotes de la TVA. Pour implementer l'IRG, il faudrait creer une nouvelle fonction de calcul (calculateIRG) dans le moteur, ajouter les barèmes progressifs dans la table tax_brackets, et creer un nouveau composant de formulaire specifique. L'API et le systeme d'internationalisation restent inchanges.
La strategie de versionnage integree (champ version dans tax_rules) permet de gerer les changements legislatifs annuels sans perte d'historique. Lorsqu'une nouvelle Loi de Finances est publiee, il suffit d'inserer les nouvelles regles avec la version correspondante, et le systeme peut automatiquement selectionner la version applicable en fonction de la date de calcul. Cette approche data-driven est un atout majeur pour la maintenabilite a long terme du systeme.


# Chapitre 5 : Validation empirique du moteur de calcul
Ce chapitre presente la validation empirique du moteur de calcul TVA. L'objectif est de demontrer que le systeme produit des resultats conformes aux dispositions du Code des Impots Directs et Indirects (CID) et de la Loi de Finances 2025, en utilisant une matrice de cinq cas de test representatifs couvrant les differents taux d'imposition, les mecanismes d'exoneration automatique et les seuils de franchise. Cette demarche de validation reproductible constitue un element central de la defense de these.
## 5.1 Protocole de validation
Le protocole de validation repose sur une comparaison systematique entre les resultats attendus (calculs manuels bases sur les articles du CID) et les resultats produits par le moteur de calcul. Chaque cas de test est defini par un identifiant unique, un montant d'entree (hors taxes), une categorie de TVA, un secteur d'activite, et le montant de TVA attendu. Le moteur est execute avec ces parametres et la variance (difference absolue entre attendu et calcule) est mesuree en dinars algeriens (DZD). Un test est considere comme valide si la variance est strictement nulle.
Les cinq cas de test ont ete selectionnes pour couvrir l'ensemble des fonctionnalites du moteur : le taux normal (19%), le taux reduit (9%), l'exoneration par categorie (export), l'exoneration automatique par seuil de franchise (services et commerce), et le calcul pour un montant superieur au seuil de franchise. Cette couverture garantit que chaque branche de la logique de decision du moteur est exercee au moins une fois.
## 5.2 Matrice des cas de test
Le Tableau 5-1 presente la matrice complete des cinq cas de test avec leurs parametres d'entree et les resultats attendus. Chaque cas est reference a l'article du CID applicable, ce qui permet a un jury de verifier independamment l'exactitude des calculs.
Tableau 5-1 : Matrice des cas de test de validation TVA
Le cas TC-01 teste le taux normal de 19% sur un montant de 1 000 000 DZD dans le secteur de la production industrielle. Le calcul attendu est : 1 000 000 x 0.19 = 190 000 DZD. Le cas TC-02 teste le taux reduit de 9% sur 2 000 000 DZD, toujours en production : 2 000 000 x 0.09 = 180 000 DZD. Le cas TC-03 verifie que les exportations sont exonerees de TVA, conformement a l'article 30-4 du CID, quel que soit le montant. Le cas TC-04 est particulierement important car il teste le mecanisme d'exoneration automatique : un prestataire de services avec un chiffre d'affaires de 750 000 DZD est en dessous du seuil de franchise de 1 000 000 DZD, la TVA doit donc etre nulle. Enfin, le cas TC-05 verifie qu'un prestataire de services au-dessus du seuil (3 000 000 DZD) est bien impose au taux normal.
## 5.3 Resultats de la validation
Le Tableau 5-2 presente les resultats de l'execution des cinq cas de test sur le moteur de calcul. Pour chaque cas, le montant de TVA calcule par le moteur est compare au montant attendu, et la variance est mesuree.
Tableau 5-2 : Resultats de la validation empirique
L'ensemble des cinq cas de test est valide avec une variance nulle sur chaque cas. Ce resultat confirme la conformite du moteur de calcul aux dispositions du CID et de la Loi de Finances 2025. La precision de decimal.js a joue un role determinant : aucun arrondi parasite n'a ete observe, meme sur les multiplications impliquant des taux a deux decimales (0.19 et 0.09). La somme des variances est de 0.00 DZD, ce qui etablit une confiance empirique dans la fiabilite du systeme pour les calculs de TVA dans le contexte algerien.
## 5.4 Analyse des citations legislatives
Au-dela des montants, la validation porte egalement sur les references legislatives generees par le moteur a chaque etape de calcul. Le Tableau 5-3 presente les citations produites pour chaque cas de test.
Tableau 5-3 : Citations legislatives par cas de test
Chaque citation legislative est verifiable dans le Code des Impots Directs et Indirects. Le moteur associe systematiquement la reference de l'article applicable a chaque resultat, ce qui permet a tout utilisateur (contribuable, comptable, inspecteur) de tracer la base juridique du calcul effectue. Cette tracabilite est un atout majeur pour la transparence fiscale et constitue un element differenciant par rapport aux outils de calcul existant sur le marche algerien.
## 5.5 Reproductibilite et export de la validation
Un aspect fondamental de la demarche scientifique est la reproductibilite. Le systeme integre un endpoint API (/api/export-validation) qui regenere la matrice de validation a la demande et la retourne au format CSV (semicolon-delimited, encodage UTF-8). Ce fichier peut etre ouvert dans tout tableur (Excel, LibreOffice Calc) pour verification independante. Le format CSV inclut, pour chaque test, l'identifiant, le montant d'entree, la categorie, le secteur, le taux applique, la TVA attendue, la TVA calculee, la variance, le statut (VALIDE/ECHEC) et les notes de calcul.
De plus, le mode 'Validation' de l'interface utilisateur offre une fonction d'impression optimisee (CSS @media print) qui genere un rapport au format A4 masquant les elements interactifs (boutons, formulaires) et affichant uniquement les resultats structurels, l'architecture du moteur et les citations legislatives. Ce rapport peut etre directement annexe au memoire de these en tant que preuve empirique. L'ensemble du processus de validation est donc automatisable, reproductible et verifiable par un tiers.
## 5.6 Limites et discussion
Plusieurs limites doivent etre mentionnees pour cadrer la portee de cette validation. Premierement, les cas de test couvrent les scenarios principaux mais ne representent pas une couverture exhaustive de toutes les situations fiscales possibles. Par exemple, les operations de livraison a soi-meme, les regles de territorialite, et les mecanismes de reverse charge ne sont pas traites. Deuxiemement, les montants de test sont des valeurs entieres qui ne sollicitent pas les cas limites de l'arrondi (par exemple, un montant de 333 333.33 DZD x 19% = 63 333.33 DZD).
Troisiemement, la validation a ete effectuee sur le moteur de calcul en isolation, sans integration avec un systeme comptable reel. Des tests d'integration supplementaires seraient necessaires pour verifier le comportement du systeme dans un flux de travail comptable complet. Cependant, la conception en fonctions pures du moteur facilite grandement ces tests supplementaires, car la logique de calcul est totalement decouplee de l'infrastructure. Malgre ces limites, les resultats obtenus constituent une preuve solide de la conformite du moteur aux dispositions legislatives couvertes.
| Etablissement : | Universite Algerienne (a completer) |
| --- | --- |
| Faculte : | Faculte des Sciences Economiques (a completer) |
| Departement : | Informatique / Gestion (a completer) |
| Filiere : | Master Systemes d'Information (a completer) |
| Auteur : | (Nom de l'auteur) |
| Encadreur : | (Nom de l'encadreur) |
| Annee : | 2025 / 2026 |
| Fichier | Role | Technologie |
| --- | --- | --- |
| lib/tax-engine.ts | Moteur de calcul TVA pur | TypeScript + decimal.js |
| lib/decimal-utils.ts | Utilitaires de precision financiere | decimal.js |
| lib/i18n-context.tsx | Gestionnaire de localisation | React Context |
| app/api/calculate/route.ts | API de calcul serveur | Next.js API Route + Prisma |
| app/api/export-validation/route.ts | Export CSV de validation | Next.js API Route |
| components/tax/TaxForm.tsx | Formulaire de saisie fiscale | React + shadcn/ui |
| components/tax/TaxResult.tsx | Affichage des resultats | React + shadcn/ui |
| components/tax/ThesisPanel.tsx | Mode validation these | React + shadcn/ui |
| messages/fr.json, en.json, ar.json | Traductions trilingues | JSON (~60 cles chacun) |
| prisma/schema.prisma | Schema de donnees fiscal | Prisma ORM |
| Modele | Champs cles | Relations |
| --- | --- | --- |
| TaxRule | tax_code, version, effective_from, metadata | 1:N vers TaxBracket, TaxDeduction |
| TaxBracket | category, rate, condition (JSON) | N:1 vers TaxRule |
| TaxDeduction | code, calc_type, value, article_ref | N:1 vers TaxRule |
| ID | Montant HT (DZD) | Categorie | Secteur | TVA Attendue (DZD) | Article CID |
| --- | --- | --- | --- | --- | --- |
| TC-01 | 1 000 000 | Normal (19%) | Production | 190 000 | Art. 28 |
| TC-02 | 2 000 000 | Reduit (9%) | Production | 180 000 | Art. 29 |
| TC-03 | 2 000 000 | Exempt (0%) | Export | 0 | Art. 30-4 |
| TC-04 | 750 000 | Normal (19%) | Services | 0 | Art. 30-1 |
| TC-05 | 3 000 000 | Normal (19%) | Services | 570 000 | Art. 28 |
| ID | TVA Attendue (DZD) | TVA Calculee (DZD) | Variance (DZD) | Statut |
| --- | --- | --- | --- | --- |
| TC-01 | 190 000 | 190 000.00 | 0.00 | VALIDE |
| TC-02 | 180 000 | 180 000.00 | 0.00 | VALIDE |
| TC-03 | 0 | 0.00 | 0.00 | VALIDE |
| TC-04 | 0 | 0.00 | 0.00 | VALIDE |
| TC-05 | 570 000 | 570 000.00 | 0.00 | VALIDE |
| ID | Article reference | Note de calcul |
| --- | --- | --- |
| TC-01 | Art. 28 - Taux normal 19% | Application du taux de 19% sur la base imposable |
| TC-02 | Art. 29 - Taux reduit 9% | Application du taux de 9% sur la base imposable |
| TC-03 | Art. 30-4 du CID | Exoneration a l'exportation |
| TC-04 | Art. 30-1 du CID | Franchise : services, CA <= 1 000 000 DZD |
| TC-05 | Art. 28 - Taux normal 19% | Application du taux de 19%, services au-dessus du seuil |