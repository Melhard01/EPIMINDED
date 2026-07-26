import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Politique de Confidentialité">
        <p className="text-sm mb-8">Dernière mise à jour : 08 Décembre 2025</p>
        
        <p>
          Cette politique de confidentialité pour SOULCHAIN ("nous", "notre" ou "nos") décrit comment et pourquoi nous pourrions accéder, collecter, stocker, utiliser et/ou partager ("traiter") vos informations personnelles lorsque vous utilisez nos services ("Services"), y compris lorsque vous :
        </p>
        <ul>
          <li>Téléchargez et utilisez notre application mobile (SOULCHAIN), ou toute autre application de notre part qui renvoie à cette politique de confidentialité</li>
          <li>Visitez notre site web à l'adresse https://www.epiminded.com</li>
          <li>Utilisez SOULCHAIN. *SOULCHAIN* est un système de diffusion de contenu ultra-personnalisé qui adapte les boosters aux intérêts uniques de chaque utilisateur, fournissant des mises à jour quotidiennes sur les sujets qui leur tiennent à cœur.</li>
        </ul>

        <h2>1. QUELLES INFORMATIONS COLLECTONS-NOUS ?</h2>
        <h3>Informations personnelles que vous nous communiquez</h3>
        <p>En bref : Nous collectons les informations personnelles que vous nous fournissez.</p>
        <p>Nous collectons les informations personnelles que vous nous fournissez volontairement lorsque vous vous inscrivez sur les Services, exprimez un intérêt à obtenir des informations sur nous ou nos produits et Services, lorsque vous participez à des activités sur les Services, ou autrement lorsque vous nous contactez.</p>
        <p>Les informations personnelles que nous collectons peuvent inclure les éléments suivants :</p>
        <ul>
          <li>noms</li>
          <li>adresses e-mail</li>
          <li>titres de poste</li>
          <li>numéros de carte de débit/crédit</li>
          <li>données de contact ou d'authentification</li>
          <li>noms d'utilisateur</li>
          <li>mots de passe</li>
          <li>numéros de téléphone</li>
          <li>pays</li>
          <li>date de naissance</li>
          <li>nom de l'entreprise</li>
          <li>projets sur lesquels vous travaillez</li>
        </ul>

        <h3>Informations collectées automatiquement</h3>
        <p>En bref : Certaines informations — telles que votre adresse de protocole Internet (IP) et/ou les caractéristiques de votre navigateur et de votre appareil — sont collectées automatiquement lorsque vous visitez nos Services.</p>
        <p>Nous collectons automatiquement certaines informations lorsque vous visitez, utilisez ou naviguez sur les Services. Ces informations ne révèlent pas votre identité spécifique (comme votre nom ou vos coordonnées) mais peuvent inclure des informations sur l'appareil et l'utilisation, telles que votre adresse IP, les caractéristiques du navigateur et de l'appareil, le système d'exploitation, les préférences linguistiques, les URL de référence, le nom de l'appareil, le pays, l'emplacement, des informations sur la façon et le moment où vous utilisez nos Services, et d'autres informations techniques.</p>

        <h2>2. COMMENT TRAITONS-NOUS VOS INFORMATIONS ?</h2>
        <p>En bref : Nous traitons vos informations pour fournir, améliorer et administrer nos Services, communiquer avec vous, pour la sécurité et la prévention de la fraude, et pour nous conformer à la loi. Nous pouvons également traiter vos informations à d'autres fins avec votre consentement.</p>
        <p>Nous traitons vos informations personnelles pour diverses raisons, selon la façon dont vous interagissez avec nos Services, y compris :</p>
        <ul>
          <li>Pour faciliter la création de compte et l'authentification et gérer autrement les comptes d'utilisateurs.</li>
          <li>Pour fournir et faciliter la prestation de services à l'utilisateur.</li>
          <li>Pour répondre aux demandes des utilisateurs/offrir une assistance aux utilisateurs.</li>
          <li>Pour exécuter et gérer vos commandes.</li>
          <li>Pour permettre les communications d'utilisateur à utilisateur.</li>
          <li>Pour demander des commentaires.</li>
          <li>Pour identifier les tendances d'utilisation.</li>
        </ul>

        <h2>3. QUAND ET AVEC QUI PARTAGEONS-NOUS VOS INFORMATIONS PERSONNELLES ?</h2>
        <p>En bref : Nous pouvons partager des informations dans des situations spécifiques décrites dans cette section et/ou avec les tiers suivants.</p>
        <p>Nous pourrions avoir besoin de partager vos informations personnelles dans les situations suivantes :</p>
        <ul>
          <li>Transferts d'entreprise. Nous pouvons partager ou transférer vos informations dans le cadre de, ou pendant les négociations de, toute fusion, vente d'actifs de l'entreprise, financement ou acquisition de tout ou partie de notre entreprise à une autre entreprise.</li>
        </ul>

        <h2>4. COMBIEN DE TEMPS CONSERVONS-NOUS VOS INFORMATIONS ?</h2>
        <p>En bref : Nous conservons vos informations aussi longtemps que nécessaire pour atteindre les objectifs décrits dans cette politique de confidentialité, sauf si la loi l'exige autrement.</p>
        <p>Nous ne conserverons vos informations personnelles qu'aussi longtemps que nécessaire aux fins énoncées dans cette politique de confidentialité, à moins qu'une période de conservation plus longue ne soit requise ou permise par la loi (comme les exigences fiscales, comptables ou autres exigences légales).</p>

        <h2>5. COMMENT ASSURONS-NOUS LA SÉCURITÉ DE VOS INFORMATIONS ?</h2>
        <p>En bref : Nous visons à protéger vos informations personnelles grâce à un système de mesures de sécurité organisationnelles et techniques.</p>
        <p>Nous avons mis en œuvre des mesures de sécurité techniques et organisationnelles appropriées et raisonnables conçues pour protéger la sécurité de toute information personnelle que nous traitons. Cependant, malgré nos garanties et nos efforts pour sécuriser vos informations, aucune transmission électronique sur Internet ou technologie de stockage d'informations ne peut être garantie à 100 % sécurisée.</p>

        <h2>6. COMMENT POUVEZ-VOUS NOUS CONTACTER CONCERNANT CETTE POLITIQUE ?</h2>
        <p>Si vous avez des questions ou des commentaires sur cette politique, vous pouvez nous envoyer un e-mail à privacy@epineon.ai.</p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm mb-8">Last updated December 08, 2025</p>
      
      <p>
        This Privacy Notice for SOULCHAIN ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
      </p>
      <ul>
        <li>Download and use our mobile application (SOULCHAIN), or any other application of ours that links to this Privacy Notice</li>
        <li>Visit our website at https://www.epiminded.com</li>
        <li>Use SOULCHAIN. *SOULCHAIN* is an ultra-personalized content delivery system that tailors boosters to each user's unique interests, providing daily updates on topics they care about.</li>
      </ul>

      <h2>1. WHAT INFORMATION DO WE COLLECT?</h2>
      <h3>Personal information you disclose to us</h3>
      <p>In Short: We collect personal information that you provide to us.</p>
      <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
      <p>The personal information we collect may include the following:</p>
      <ul>
        <li>names</li>
        <li>email addresses</li>
        <li>job titles</li>
        <li>debit/credit card numbers</li>
        <li>contact or authentication data</li>
        <li>usernames</li>
        <li>passwords</li>
        <li>phone numbers</li>
        <li>country</li>
        <li>date of birth</li>
        <li>name of company</li>
        <li>projects he works on</li>
      </ul>

      <h3>Information automatically collected</h3>
      <p>In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</p>
      <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.</p>

      <h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
      <p>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
      <p>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
      <ul>
        <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
        <li>To deliver and facilitate delivery of services to the user.</li>
        <li>To respond to user inquiries/offer support to users.</li>
        <li>To fulfill and manage your orders.</li>
        <li>To enable user-to-user communications.</li>
        <li>To request feedback.</li>
        <li>To identify usage trends.</li>
      </ul>

      <h2>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
      <p>In Short: We may share information in specific situations described in this section and/or with the following third parties.</p>
      <p>We may need to share your personal information in the following situations:</p>
      <ul>
        <li>Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
      </ul>

      <h2>4. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
      <p>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
      <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).</p>

      <h2>5. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
      <p>In Short: We aim to protect your personal information through a system of organizational and technical security measures.</p>
      <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>

      <h2>6. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
      <p>If you have questions or comments about this notice, you may email us at privacy@epineon.ai.</p>
    </LegalLayout>
  );
}
