import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Conditions générales">
        <p className="text-sm mb-8">Dernière mise à jour : 8 décembre 2025</p>
        
        <p>
          Bienvenue sur SOULCHAIN. En accédant à notre site web et en utilisant nos services, vous acceptez d’être soumis aux présentes Conditions générales.
        </p>

        <h2>1. Acceptation des conditions</h2>
        <p>
          En utilisant notre application mobile (SOULCHAIN) ou notre site web, vous acceptez l’intégralité des présentes conditions. Si vous êtes en désaccord avec une partie quelconque de ces conditions, vous ne devez pas utiliser nos services.
        </p>

        <h2>2. Description du service</h2>
        <p>
          SOULCHAIN est un système de diffusion de contenu ultra-personnalisé qui adapte des boosters aux centres d’intérêt propres à chaque utilisateur, en fournissant des mises à jour quotidiennes sur les sujets qui lui tiennent à cœur. La plateforme s’appuie également sur le réseautage en regroupant les utilisateurs partageant les mêmes sujets.
        </p>

        <h2>3. Inscription et compte</h2>
        <p>
          Pour utiliser certaines fonctionnalités de nos services, vous pouvez être amené à créer un compte. Vous êtes responsable de la confidentialité des informations de votre compte et de toutes les activités qui s’y déroulent.
        </p>

        <h2>4. Utilisation acceptable</h2>
        <p>
          Vous vous engagez à ne pas utiliser nos services à des fins illégales ou non autorisées. Dans le cadre de l’utilisation du service, vous ne devez enfreindre aucune loi de votre juridiction.
        </p>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le service ainsi que son contenu original, ses fonctionnalités et ses caractéristiques sont et resteront la propriété exclusive de SOULCHAIN et de ses concédants de licence.
        </p>

        <h2>6. Limitation de responsabilité</h2>
        <p>
          En aucun cas SOULCHAIN, ni ses dirigeants, employés, partenaires, agents, fournisseurs ou sociétés affiliées, ne pourront être tenus responsables de dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, y compris, sans s’y limiter, la perte de bénéfices, de données, d’usage, de clientèle ou d’autres pertes immatérielles.
        </p>

        <h2>7. Modifications</h2>
        <p>
          Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer les présentes Conditions à tout moment. Si une révision est substantielle, nous nous efforcerons de vous en informer au moins 30 jours avant l’entrée en vigueur des nouvelles conditions.
        </p>

        <h2>8. Nous contacter</h2>
        <p>
          Pour toute question concernant les présentes Conditions, contactez-nous à l’adresse support@epiminded.com.
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
