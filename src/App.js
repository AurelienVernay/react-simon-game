import "./App.css";
import React from "react";
import logoMini from "./logo-mini.svg";
import headerLogo from "./logo.png";
import SimonGame from "./Simon";
function App() {
  return (
    <div className="App h-100 d-flex flex-column justify-content-between align-items-center text-center">
      <Header />
      <SimonInstructions />
      <SimonGame />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header>
      <a
        className="ribbon"
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/aurelienvernay/angular-simon-game"
      >
        <img
          width="149"
          height="149"
          src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149"
          className="attachment-full size-full"
          alt="Fork me on GitHub"
          data-recalc-dims="1"
        />
      </a>
      <a href="https://aurelienvernay.github.io">
        <img
          src={headerLogo}
          alt="Aurélien Vernay Solutions"
          style={{ maxWidth: "100%", maxHeight: "250px", margin: "0 auto" }}
        />
      </a>
      <h1>React Simon Game</h1>
    </header>
  );
}

function Footer() {
  return (
    <div className="footer text-muted">
      <p>
        Cette application a été réalisée avec le framework &nbsp;
        <a
          href="https://reactjs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          React
        </a>
        , ainsi que la bibliotèque de programmation réactive{" "}
        <a
          href="https://github.com/ReactiveX/rxjs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rxjs
        </a>
        , la bibliothèque audio{" "}
        <a
          href="https://howlerjs.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Howler.js
        </a>{" "}
        et la bibliothèque UI{" "}
        <a
          href="https://getbootstrap.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bootstrap
        </a>
        .
      </p>
      <p>
        <img src={logoMini} alt="Aurélien Vernay Solutions" height="32" />
        2019 - Fait par Aurélien VERNAY (visitez mon{" "}
        <a href="https://aurelienvernay.github.io">site web</a> pour en savoir
        plus)
      </p>
    </div>
  );
}
function SimonInstructions() {
  return (
    <section>
      <h2>Instructions</h2>
      <p>
        Appuyez sur <em>Start</em> pour commencer la partie. Observez la
        séquence de couleurs programmée par Simon, et ne vous trompez pas !
      </p>
      <p>
        Utilisez le bouton Reset pour recommencer la partie à 0. Attention :
        cela effacera votre record !
      </p>
    </section>
  );
}
export default App;
