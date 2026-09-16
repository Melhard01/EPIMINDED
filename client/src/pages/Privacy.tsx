import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Politique de confidentialité">
        <p className="text-sm mb-8">Dernière mise à jour : 8 décembre 2025</p>
        
        <p>
          La présente Politique de confidentialité de SOULCHAIN (« nous », « notre », « nos ») décrit comment et pourquoi nous pouvons accéder à vos informations personnelles, les collecter, les stocker, les utiliser et/ou les partager (« traiter ») lorsque vous utilisez nos services (« Services »), notamment lorsque vous :
        </p>
        <ul>
          <li>Téléchargez et utilisez notre application mobile (SOULCHAIN), ou toute autre application de notre part renvoyant à la présente Politique de confidentialité</li>
          <li>Visitez notre site web à l’adresse https://soulchain.net</li>
          <li>Utilisez SOULCHAIN. SOULCHAIN est un système de diffusion de contenu ultra-personnalisé qui adapte des boosters aux centres d’intérêt propres à chaque utilisateur, en fournissant des mises à jour quotidiennes sur les sujets qui lui tiennent à cœur.</li>
        </ul>

        <h2>1. QUELLES INFORMATIONS COLLECTONS-NOUS ?</h2>
        <h3>Informations personnelles que vous nous communiquez</h3>
        <p>En bref : nous collectons les informations personnelles que vous nous fournissez.</p>
        <p>Nous collectons les informations personnelles que vous nous fournissez volontairement lorsque vous vous inscrivez sur les Services, exprimez un intérêt pour obtenir des informations sur nous ou sur nos produits et Services, participez à des activités sur les Services, ou nous contactez de toute autre manière.</p>
        <p>Les informations personnelles que nous collectons peuvent inclure :</p>
        <ul>
          <li>noms</li>
          <li>adresses e-mail</li>
          <li>intitulés de poste</li>
          <li>numéros de carte bancaire</li>
          <li>données de contact ou d’authentification</li>
          <li>noms d’utilisateur</li>
          <li>mots de passe</li>
          <li>numéros de téléphone</li>
          <li>pays</li>
          <li>date de naissance</li>
          <li>nom de l’entreprise</li>
          <li>projets sur lesquels vous travaillez</li>
        </ul>

        <h3>Informations collectées automatiquement</h3>
        <p>En bref : certaines informations — telles que votre adresse IP et/ou les caractéristiques de votre navigateur et de votre appareil — sont collectées automatiquement lorsque vous visitez nos Services.</p>
        <p>Nous collectons automatiquement certaines informations lorsque vous visitez, utilisez ou naviguez sur les Services. Ces informations ne révèlent pas votre identité précise (comme votre nom ou vos coordonnées) mais peuvent inclure des informations sur l’appareil et l’utilisation, telles que votre adresse IP, les caractéristiques de votre navigateur et de votre appareil, le système d’exploitation, les préférences linguistiques, les URL de provenance, le nom de l’appareil, le pays, la localisation, des informations sur la façon dont et le moment où vous utilisez nos Services, ainsi que d’autres informations techniques.</p>

        <h2>2. COMMENT TRAITONS-NOUS VOS INFORMATIONS ?</h2>
        <p>En bref : nous traitons vos informations pour fournir, améliorer et administrer nos Services, communiquer avec vous, assurer la sécurité et prévenir la fraude, et respecter la loi. Nous pouvons également traiter vos informations à d’autres fins avec votre consentement.</p>
        <p>Nous traitons vos informations personnelles pour diverses raisons, selon la manière dont vous interagissez avec nos Services, notamment :</p>
        <ul>
          <li>Pour faciliter la création de compte et l’authentification, et gérer les comptes utilisateurs.</li>
          <li>Pour fournir et faciliter la fourniture des services à l’utilisateur.</li>
          <li>Pour répondre aux demandes des utilisateurs et leur apporter un support.</li>
          <li>Pour traiter et gérer vos commandes.</li>
          <li>Pour permettre les communications entre utilisateurs.</li>
          <li>Pour solliciter vos retours.</li>
          <li>Pour identifier les tendances d’utilisation.</li>
        </ul>

        <h2>3. QUAND ET AVEC QUI PARTAGEONS-NOUS VOS INFORMATIONS PERSONNELLES ?</h2>
        <p>En bref : nous pouvons partager des informations dans les situations spécifiques décrites dans cette section et/ou avec les tiers suivants.</p>
        <p>Nous pouvons être amenés à partager vos informations personnelles dans les situations suivantes :</p>
        <ul>
          <li>Transferts d’activité. Nous pouvons partager ou transférer vos informations dans le cadre de, ou lors des négociations relatives à, toute fusion, vente d’actifs de l’entreprise, financement ou acquisition de tout ou partie de notre activité par une autre société.</li>
        </ul>

        <h2>4. COMBIEN DE TEMPS CONSERVONS-NOUS VOS INFORMATIONS ?</h2>
        <p>En bref : nous conservons vos informations aussi longtemps que nécessaire pour atteindre les finalités décrites dans la présente Politique de confidentialité, sauf obligation légale contraire.</p>
        <p>Nous ne conserverons vos informations personnelles que le temps nécessaire aux finalités énoncées dans la présente Politique de confidentialité, sauf si une durée de conservation plus longue est requise ou permise par la loi (obligations fiscales, comptables ou autres obligations légales, par exemple).</p>

        <h2>5. COMMENT PROTÉGEONS-NOUS VOS INFORMATIONS ?</h2>
        <p>En bref : nous visons à protéger vos informations personnelles grâce à un ensemble de mesures de sécurité organisationnelles et techniques.</p>
        <p>Nous avons mis en place des mesures de sécurité techniques et organisationnelles appropriées et raisonnables, conçues pour protéger la sécurité de toutes les informations personnelles que nous traitons. Toutefois, malgré nos garanties et nos efforts pour sécuriser vos informations, aucune transmission électronique sur Internet ni aucune technologie de stockage d’informations ne peut être garantie sûre à 100 %.</p>

        <h2>6. COMMENT NOUS CONTACTER AU SUJET DE CETTE POLITIQUE ?</h2>
        <p>Pour toute question ou remarque concernant la présente politique, vous pouvez nous écrire à privacy@epineon.ai.</p>
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
        <li>Visit our website at https://soulchain.net</li>
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
