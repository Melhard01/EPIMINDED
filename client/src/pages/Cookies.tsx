import LegalLayout from "@/components/LegalLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Cookies() {
  const { language } = useLanguage();

  if (language === 'fr') {
    return (
      <LegalLayout title="Politique relative aux cookies">
        <p className="text-sm mb-8">Dernière mise à jour : 8 décembre 2025</p>
        
        <p>
          La présente Politique relative aux cookies explique comment SOULCHAIN (« la Société », « nous », « notre », « nos ») utilise des cookies et des technologies similaires pour vous reconnaître lorsque vous visitez notre site web à l’adresse https://soulchain.net (« Site »). Elle explique ce que sont ces technologies et pourquoi nous les utilisons, ainsi que vos droits pour en contrôler l’utilisation.
        </p>

        <h2>Qu’est-ce qu’un cookie ?</h2>
        <p>
          Les cookies sont de petits fichiers de données placés sur votre ordinateur ou votre appareil mobile lorsque vous visitez un site web. Ils sont largement utilisés par les propriétaires de sites pour faire fonctionner leurs sites, ou les faire fonctionner plus efficacement, ainsi que pour fournir des informations de reporting.
        </p>
        <p>
          Les cookies déposés par le propriétaire du site (ici, SOULCHAIN) sont appelés « cookies internes ». Les cookies déposés par des tiers sont appelés « cookies tiers ». Les cookies tiers permettent de fournir des fonctionnalités tierces sur ou via le site (par exemple : publicité, contenu interactif et analyse d’audience).
        </p>

        <h2>Pourquoi utilisons-nous des cookies ?</h2>
        <p>
          Nous utilisons des cookies internes et tiers pour plusieurs raisons. Certains cookies sont nécessaires pour des raisons techniques au fonctionnement de notre Site : nous les appelons cookies « essentiels » ou « strictement nécessaires ». D’autres cookies nous permettent également de suivre et de cibler les centres d’intérêt de nos utilisateurs afin d’améliorer l’expérience sur nos propriétés en ligne. Des tiers déposent des cookies via notre Site à des fins publicitaires, d’analyse et autres.
        </p>

        <h2>Comment puis-je contrôler les cookies ?</h2>
        <p>
          Vous avez le droit de décider d’accepter ou de refuser les cookies. Vous pouvez exercer ce droit en définissant vos préférences dans le Gestionnaire de consentement aux cookies. Celui-ci vous permet de sélectionner les catégories de cookies que vous acceptez ou refusez. Les cookies essentiels ne peuvent pas être refusés, car ils sont strictement nécessaires à la fourniture des services.
        </p>
        <p>
          Le Gestionnaire de consentement aux cookies est accessible dans le bandeau de notification et sur notre Site. Si vous choisissez de refuser les cookies, vous pourrez toujours utiliser notre Site, mais votre accès à certaines fonctionnalités et zones du Site pourra être restreint. Vous pouvez également paramétrer ou modifier les réglages de votre navigateur pour accepter ou refuser les cookies.
        </p>

        <h2>Comment contrôler les cookies dans mon navigateur ?</h2>
        <p>
          Les moyens de refuser les cookies via les réglages de votre navigateur variant d’un navigateur à l’autre, consultez le menu d’aide de votre navigateur pour plus d’informations.
        </p>

        <h2>Qu’en est-il des autres technologies de suivi, comme les balises web ?</h2>
        <p>
          Les cookies ne sont pas le seul moyen de reconnaître ou de suivre les visiteurs d’un site web. Nous pouvons également utiliser des technologies similaires, comme les balises web, parfois appelées « pixels de suivi » ou « GIF invisibles ». Il s’agit de minuscules fichiers graphiques contenant un identifiant unique qui nous permet de savoir quand quelqu’un a visité notre Site ou ouvert un e-mail qui en contient.
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Cookie Policy">
      <p className="text-sm mb-8">Last updated December 08, 2025</p>
      
      <p>
        This Cookie Policy explains how SOULCHAIN ("Company," "we," "us," and "our") uses cookies and similar technologies to recognize you when you visit our website at https://soulchain.net ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
      </p>
      <p>
        Cookies set by the website owner (in this case, SOULCHAIN) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
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
