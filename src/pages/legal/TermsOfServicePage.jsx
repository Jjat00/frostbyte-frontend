import React from "react";
import LegalPage, { LegalSection } from "./LegalPage";

const TermsOfServicePage = () => {
  return (
    <LegalPage
      title="Términos de Servicio"
      description="Términos de Servicio de Frostbyte: condiciones de uso del sitio y del inicio de sesión con Google."
      lastUpdated="29 de mayo de 2026"
    >
      <LegalSection>
        <p>
          Estos Términos de Servicio regulan el uso del sitio web y los
          servicios de <strong>Frostbyte</strong> (Cumbal, Nariño, Colombia). Al
          acceder al sitio o iniciar sesión con Google, aceptas estos términos
          en su totalidad. Si no estás de acuerdo, por favor no uses el servicio.
        </p>
      </LegalSection>

      <LegalSection title="1. Descripción del servicio">
        <p>
          Frostbyte ofrece una carta digital de bebidas heladas y experiencias
          dentro del local, junto con una cuenta de cliente —mediante inicio de
          sesión con Google— que permite acceder a funciones y servicios para
          clientes, como actividades y promociones y, a futuro, la realización
          de pedidos.
        </p>
      </LegalSection>

      <LegalSection title="2. Cuentas e inicio de sesión">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Para acceder a las funciones para clientes debes iniciar sesión con
            una cuenta de Google válida.
          </li>
          <li>
            Se permite <strong>una sola cuenta por persona</strong>. Crear
            varias cuentas para obtener ventaja puede llevar a la suspensión del
            acceso.
          </li>
          <li>
            Eres responsable de la actividad realizada desde tu cuenta y de
            mantener la confidencialidad de tu acceso.
          </li>
          <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Actividades y promociones">
        <p>
          De vez en cuando, Frostbyte puede ofrecer actividades, juegos o
          promociones para sus clientes. Cada una tendrá sus propias reglas y
          condiciones, que se publicarán en el sitio o en el local en su
          momento. Salvo que se indique lo contrario, la participación es
          voluntaria y gratuita.
        </p>
      </LegalSection>

      <LegalSection title="4. Conducta del usuario">
        <p>Al usar el servicio te comprometes a no:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Usar el sitio con fines ilícitos o fraudulentos.</li>
          <li>
            Intentar vulnerar la seguridad o interferir con el funcionamiento
            del servicio.
          </li>
          <li>Suplantar a otras personas o crear cuentas falsas.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Propiedad intelectual">
        <p>
          La marca Frostbyte, el logotipo, los textos, diseños y demás
          contenidos del sitio son propiedad de Frostbyte y están protegidos por
          la ley. No pueden reproducirse sin autorización.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitación de responsabilidad">
        <p>
          El servicio se ofrece "tal cual". Frostbyte no garantiza la
          disponibilidad ininterrumpida del sitio ni se hace responsable por
          fallas de proveedores externos (como el servicio de inicio de sesión
          de Google).
        </p>
      </LegalSection>

      <LegalSection title="7. Modificaciones">
        <p>
          Podemos actualizar estos Términos en cualquier momento. La versión
          vigente se publicará en esta página con su fecha de actualización. El
          uso continuado del servicio implica la aceptación de los cambios.
        </p>
      </LegalSection>

      <LegalSection title="8. Ley aplicable y contacto">
        <p>
          Estos Términos se rigen por las leyes de la República de Colombia.
          Para cualquier duda escríbenos por{" "}
          <a
            href="https://wa.me/573164277879"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp (+57 316 427 7879)
          </a>{" "}
          o Instagram{" "}
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
    </LegalPage>
  );
};

export default TermsOfServicePage;
