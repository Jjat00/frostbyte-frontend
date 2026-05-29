import React from "react";
import LegalPage, { LegalSection } from "./LegalPage";

const PrivacyPolicyPage = () => {
  return (
    <LegalPage
      title="Política de Privacidad"
      description="Política de Privacidad de Frostbyte: qué datos recopilamos al iniciar sesión con Google, cómo los usamos y cuáles son tus derechos."
      lastUpdated="29 de mayo de 2026"
    >
      <LegalSection>
        <p>
          En <strong>Frostbyte</strong> (Cumbal, Nariño, Colombia) respetamos tu
          privacidad. Esta política explica qué datos personales recopilamos
          cuando usas nuestro sitio y servicios —incluido el inicio de sesión
          con Google— para qué los usamos y cómo los protegemos.
        </p>
        <p>
          Al usar el sitio y, en particular, al iniciar sesión con tu cuenta de
          Google, aceptas las prácticas descritas en esta política.
        </p>
      </LegalSection>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable de tus datos es Frostbyte, ubicado en Cra. 8 #18-13,
          Cumbal, Nariño, Colombia. Puedes contactarnos por{" "}
          <a
            href="https://wa.me/573164277879"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp (+57 316 427 7879)
          </a>{" "}
          o por Instagram{" "}
          <a
            href="https://www.instagram.com/frostbyte.col/"
            target="_blank"
            rel="noopener noreferrer"
          >
            @frostbyte.col
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recopilamos">
        <p>
          Cuando inicias sesión con Google (Google Sign-In), recibimos de tu
          perfil de Google únicamente los siguientes datos básicos:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tu nombre y apellido.</li>
          <li>Tu dirección de correo electrónico.</li>
          <li>Tu foto de perfil (avatar).</li>
          <li>
            Un identificador único de tu cuenta de Google (Google ID), que nos
            permite reconocerte en futuros inicios de sesión.
          </li>
        </ul>
        <p>
          <strong>No</strong> tenemos acceso a tu contraseña de Google ni a
          ningún otro dato de tu cuenta (contactos, calendario, archivos, etc.).
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo usamos tus datos">
        <p>Usamos tus datos exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Crear y administrar tu cuenta de cliente.</li>
          <li>
            Identificarte y mostrar tu nombre y foto dentro de las funciones que
            lo requieran.
          </li>
          <li>
            Prestarte los servicios para clientes que ofrezcamos (por ejemplo,
            participar en actividades y promociones o, a futuro, realizar
            pedidos).
          </li>
          <li>
            Comunicarte información relevante sobre tu cuenta y los servicios.
          </li>
        </ul>
        <p>
          <strong>
            No vendemos, alquilamos ni compartimos tus datos personales con
            terceros con fines publicitarios.
          </strong>
        </p>
      </LegalSection>

      <LegalSection title="4. Almacenamiento y seguridad">
        <p>
          Tus datos se almacenan en nuestros servidores de forma segura y solo
          el personal autorizado de Frostbyte puede acceder a ellos. La sesión
          se mantiene mediante tokens de autenticación guardados en tu
          navegador; puedes cerrarla en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="5. Conservación de los datos">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa o mientras sean
          necesarios para prestarte el servicio. Si solicitas la eliminación de
          tu cuenta, borraremos tus datos personales, salvo aquellos que debamos
          conservar por obligaciones legales.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          De acuerdo con la Ley 1581 de 2012 de Colombia (protección de datos
          personales), tienes derecho a conocer, actualizar, rectificar y
          solicitar la eliminación de tus datos, así como a revocar tu
          autorización. Para ejercer estos derechos, escríbenos por{" "}
          <a
            href="https://wa.me/573164277879"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>{" "}
          o Instagram y atenderemos tu solicitud.
        </p>
      </LegalSection>

      <LegalSection title="7. Servicios de terceros">
        <p>
          Usamos <strong>Google Sign-In</strong> para autenticarte. El uso de
          los datos por parte de Google se rige por su propia{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidad
          </a>
          . Te recomendamos revisarla.
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Publicaremos la
          versión vigente en esta misma página, indicando la fecha de la última
          actualización.
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default PrivacyPolicyPage;
