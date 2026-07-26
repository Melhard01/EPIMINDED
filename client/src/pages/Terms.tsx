import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Conditions Générales d'Utilisation">
        <p className="text-sm mb-8">Dernière mise à jour : 08 Décembre 2025</p>
        
        <p>
          Bienvenue sur SOULCHAIN. En accédant à notre site web et en utilisant nos services, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation.
        </p>

        <h2>1. Acceptation des conditions</h2>
        <p>
          En utilisant notre application mobile (SOULCHAIN) ou notre site web, vous acceptez ces conditions dans leur intégralité. Si vous n'êtes pas d'accord avec une partie de ces conditions, vous ne devez pas utiliser nos services.
        </p>

        <h2>2. Description du service</h2>
        <p>
          SOULCHAIN est un système de diffusion de contenu ultra-personnalisé qui adapte les boosters aux intérêts uniques de chaque utilisateur, fournissant des mises à jour quotidiennes sur les sujets qui leur tiennent à cœur. La plateforme favorise également le réseautage en regroupant les utilisateurs ayant des sujets communs.
        </p>

        <h2>3. Inscription et compte</h2>
        <p>
          Pour utiliser certaines fonctionnalités de nos services, vous devrez peut-être créer un compte. Vous êtes responsable du maintien de la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.
        </p>

        <h2>4. Utilisation acceptable</h2>
        <p>
          Vous acceptez de ne pas utiliser nos services à des fins illégales ou non autorisées. Vous ne devez pas, dans l'utilisation du service, violer les lois de votre juridiction.
        </p>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive d'SOULCHAIN et de ses concédants de licence.
        </p>

        <h2>6. Limitation de responsabilité</h2>
        <p>
          En aucun cas SOULCHAIN, ni ses directeurs, employés, partenaires, agents, fournisseurs ou affiliés, ne pourront être tenus responsables de tout dommage indirect, accessoire, spécial, consécutif ou punitif, y compris, sans s'y limiter, la perte de profits, de données, d'utilisation, de bonne volonté ou d'autres pertes intangibles.
        </p>

        <h2>7. Modifications</h2>
        <p>
          Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces conditions à tout moment. Si une révision est importante, nous essaierons de fournir un préavis d'au moins 30 jours avant que les nouvelles conditions ne prennent effet.
        </p>

        <h2>8. Contact</h2>
        <p>
          Si vous avez des questions concernant ces conditions, veuillez nous contacter à support@epiminded.com.
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Terms and Conditions">
      <p className="text-sm mb-8">Last updated December 08, 2025</p>
      
      <p>
        Welcome to SOULCHAIN. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By using our mobile application (SOULCHAIN) or our website, you agree to these terms in full. If you disagree with any part of these terms, you must not use our services.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        SOULCHAIN is an ultra-personalized content delivery system that tailors boosters to each user's unique interests, providing daily updates on topics they care about. The platform also leverages networking by grouping users with shared topics.
      </p>

      <h2>3. Registration and Account</h2>
      <p>
        To use certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>
        You agree not to use our services for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are and will remain the exclusive property of SOULCHAIN and its licensors.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        In no event shall SOULCHAIN, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
      </p>

      <h2>7. Changes</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at support@epiminded.com.
      </p>
    </LegalLayout>
  );
}
