import { useState } from "react";
import styles from "./LoginPage.module.css";
import animations from "./LoginAnimations.module.css";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className={styles.page}>
      {/* Fundo Decorativo */}
      <div className={styles.background}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>

        <div className={styles.line1}></div>
        <div className={styles.line2}></div>
      </div>

      <div
        className={`${styles.authContainer} ${
          isRegister ? styles.registerMode : ""
        }`}
      >
        {/* Painel Institucional */}
        <div className={styles.visualPanel}>
          <div className={styles.visualImage}></div>

          <div className={styles.visualOverlay}></div>

          <div className={styles.visualContent}>
            <span className={styles.visualTag}>
              Plataforma Educacional
            </span>

            {!isRegister ? (
              <>
                <h1>
                  Bem-vindo
                  <br />
                  novamente
                </h1>

                <p>
                  Organize seus estudos, acompanhe sua evolução
                  e mantenha tudo centralizado em uma única
                  experiência elegante e intuitiva.
                </p>

                <button
                  onClick={() => setIsRegister(true)}
                  className={styles.switchButton}
                >
                  Criar Conta
                </button>
              </>
            ) : (
              <>
                <h1>
                  Já possui
                  <br />
                  uma conta?
                </h1>

                <p>
                  Entre novamente e continue sua jornada
                  exatamente de onde parou.
                </p>

                <button
                  onClick={() => setIsRegister(false)}
                  className={styles.switchButton}
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Área dos Formulários */}
        <div className={styles.formsArea}>
          {/* LOGIN */}
          <div
            className={`${styles.formWrapper} ${
              !isRegister
                ? styles.formActive
                : styles.formHidden
            }`}
          >
            <form className={styles.form}>
              <div className={styles.formHeader}>
                <span>Acesso</span>
                <h2>Entrar</h2>

                <p>
                  Utilize suas credenciais para acessar
                  a plataforma.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                />
              </div>

              <div className={styles.optionsRow}>
                <label className={styles.checkbox}>
                  <input type="checkbox" />
                  <span>Lembrar acesso</span>
                </label>

                <button
                  type="button"
                  className={styles.linkButton}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
              >
                Entrar
              </button>

              <div className={styles.mobileSwitch}>
                <span>Não possui conta?</span>

                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>

          {/* CADASTRO */}
          <div
            className={`${styles.formWrapper} ${
              isRegister
                ? styles.formActive
                : styles.formHidden
            }`}
          >
            <form className={styles.form}>
              <div className={styles.formHeader}>
                <span>Cadastro</span>

                <h2>Criar Conta</h2>

                <p>
                  Preencha suas informações para iniciar
                  sua experiência.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label>Nome Completo</label>

                <input
                  type="text"
                  placeholder="Seu nome"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Email</label>

                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Senha</label>

                <input
                  type="password"
                  placeholder="Crie uma senha"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Confirmar Senha</label>

                <input
                  type="password"
                  placeholder="Repita sua senha"
                />
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
              >
                Criar Conta
              </button>

              <div className={styles.mobileSwitch}>
                <span>Já possui conta?</span>

                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}