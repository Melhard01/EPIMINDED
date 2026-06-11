import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Cookies() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Politique des Cookies">
        <p className="text-sm mb-8">Dernière mise à jour : 08 Décembre 2025</p>
        
        <p>
          Cette politique relative aux cookies explique comment Epiminded ("Société", "nous", "notre" et "nos") utilise les cookies et des technologies similaires pour vous reconnaître lorsque vous visitez notre site web à l'adresse https://www.epiminded.com ("Site web"). Elle explique ce que sont ces technologies et pourquoi nous les utilisons, ainsi que vos droits pour contrôler notre utilisation de celles-ci.
        </p>

        <h2>Que sont les cookies ?</h2>
        <p>
          Les cookies sont de petits fichiers de données qui sont placés sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Les cookies sont largement utilisés par les propriétaires de sites web afin de faire fonctionner leurs sites web, ou de les faire fonctionner plus efficacement, ainsi que pour fournir des informations de rapport.
        </p>
        <p>
          Les cookies définis par le propriétaire du site web (dans ce cas, Epiminded) sont appelés "cookies internes". Les cookies définis par des parties autres que le propriétaire du site web sont appelés "cookies tiers". Les cookies tiers permettent de fournir des caractéristiques ou des fonctionnalités tierces sur ou via le site web (par exemple, la publicité, le contenu interactif et les analyses).
        </p>

        <h2>Pourquoi utilisons-nous des cookies ?</h2>
        <p>
          Nous utilisons des cookies internes et tiers pour plusieurs raisons. Certains cookies sont nécessaires pour des raisons techniques afin que notre site web fonctionne, et nous les appelons cookies "essentiels" ou "strictement nécessaires". D'autres cookies nous permettent également de suivre et de cibler les intérêts de nos utilisateurs pour améliorer l'expérience sur nos propriétés en ligne. Des tiers servent des cookies via notre site web à des fins de publicité, d'analyse et à d'autres fins.
        </p>

        <h2>Comment puis-je contrôler les cookies ?</h2>
        <p>
          Vous avez le droit de décider d'accepter ou de refuser les cookies. Vous pouvez exercer vos droits en matière de cookies en définissant vos préférences dans le gestionnaire de consentement aux cookies. Le gestionnaire de consentement aux cookies vous permet de sélectionner les catégories de cookies que vous acceptez ou refusez. Les cookies essentiels ne peuvent pas être refusés car ils sont strictement nécessaires pour vous fournir des services.
        </p>
        <p>
          Le gestionnaire de consentement aux cookies se trouve dans la bannière de notification et sur notre site web. Si vous choisissez de refuser les cookies, vous pouvez toujours utiliser notre site web, bien que votre accès à certaines fonctionnalités et zones de notre site web puisse être restreint. Vous pouvez également configurer ou modifier les contrôles de votre navigateur web pour accepter ou refuser les cookies.
        </p>

        <h2>Comment puis-je contrôler les cookies sur mon navigateur ?</h2>
        <p>
          Comme les moyens par lesquels vous pouvez refuser les cookies via les contrôles de votre navigateur web varient d'un navigateur à l'autre, vous devriez visiter le menu d'aide de votre navigateur pour plus d'informations.
        </p>

        <h2>Qu'en est-il des autres technologies de suivi, comme les balises web ?</h2>
        <p>
          Les cookies ne sont pas le seul moyen de reconnaître ou de suivre les visiteurs d'un site web. Nous pouvons utiliser d'autres technologies similaires de temps à autre, comme les balises web (parfois appelées "pixels de suivi" ou "gifs invisibles"). Ce sont de minuscules fichiers graphiques qui contiennent un identifiant unique qui nous permet de reconnaître quand quelqu'un a visité notre site web ou ouvert un e-mail les incluant.
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Cookie Policy">
      <p className="text-sm mb-8">Last updated December 08, 2025</p>
      
      <p>
        This Cookie Policy explains how Epiminded ("Company," "we," "us," and "our") uses cookies and similar technologies to recognize you when you visit our website at https://www.epiminded.com ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
      </p>
      <p>
        Cookies set by the website owner (in this case, Epiminded) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
      </p>

      <h2>Why do we use cookies?</h2>
      <p>
        We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes.
      </p>

      <h2>How can I control cookies?</h2>
      <p>
        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
      </p>
      <p>
        The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
      </p>

      <h2>How can I control cookies on my browser?</h2>
      <p>
        As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
      </p>

      <h2>What about other tracking technologies, like web beacons?</h2>
      <p>
        Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them.
      </p>
    </LegalLayout>
  );
}
