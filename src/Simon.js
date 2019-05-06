import "./Simon.css";

import { Howl } from "howler";
import React from "react";
import Modal from "react-modal";
import { interval, Subject } from "rxjs";
import { map, take, throttleTime } from "rxjs/operators";

/**
 * Main class including all the logic of the game
 */
export default class SimonGame extends React.Component {
  /**
   * @property blinkingColor
   * holds the color of the blinking color
   */
  blinkingColor = "";

  /**
   * @property \_blinkGreen
   * Subject that emits value when the green light must blink
   */
  _blinkGreen = new Subject();
  /**
   * @property \_blinkRed
   * Subject that emits value when the red light must blink
   */
  _blinkRed = new Subject();
  /**
   * @property \_blinkYellow
   * Subject that emits value when the yellow light must blink
   */
  _blinkYellow = new Subject();
  /**
   * @property \_blinkBlue
   * Subject that emits value when the blue light must blink
   */
  _blinkBlue = new Subject();
  /**
   * @property \_endPlay
   * Subject that emits value when howler has finished emitting sound
   */
  _endPlay = new Subject();
  /**
   * @property \_nextRound
   * Subject that emits value when the user succeeds to the next round
   */
  _nextRound = new Subject();
  /**
   * @property \_howl
   * property holding the Howler.js object (see http://howlerjs.com/docs for more info )
   */
  _howl;
  /**
   * @property \_sequence
   * array containing the sequence computed by Simon to be played.
   *  Do not reach directly, use _sequence()_ getter and setter
   */
  _sequence = [];
  /**
   * @getter sequence()
   * returns _sequence property. Use the getter instead of direct access of private component
   */
  get sequence() {
    return this._sequence;
  }
  /**
   * @setter sequence()
   * sets _sequence property and emits values to make Simon blink. Use the setter instead of direct access of private component
   */
  set sequence(array) {
    this._sequence = array;
    // if the sequence is not empty, play it
    if (this.sequence.length) {
      // emit an observable every 1000 milliseconds
      interval(1000)
        .pipe(
          // take only the length of the sequence to be played
          take(this.sequence.length),
          // get the name of the color to be played
          map(index => this.sequence[index])
        )
        .subscribe(color => {
          //emits value on the right subject. emits false to indicate that it's not the player who clicked the frame.
          switch (color) {
            case "green":
              this._blinkGreen.next(false);
              break;
            case "red":
              this._blinkRed.next(false);
              break;
            case "yellow":
              this._blinkYellow.next(false);
              break;
            case "blue":
              this._blinkBlue.next(false);
              break;
            default:
              break;
          }
        });
    }
  }

  /**
   * @propery \_playSequence
   * array containing the sequence played by the player.
   * _Do not access it directly, please use playSequence() getter and setter to respect logic._
   */
  _playSequence = [];
  /**
   * @getter playSequence
   * returns the _\_playSequence_ property.
   */
  get playSequence() {
    return this._playSequence;
  }
  /**
   * @setter playSequence
   * set the sequence played by the user, and check for errors.
   * If the user missed, opens the modal which finishes the game.
   * If the played sequence matches the sequence computed by simon,
   * emits value to go the next round.
   */
  set playSequence(array) {
    this._playSequence = array;
    if (this.state.playing && array.length) {
      console.log("sequence played", this.playSequence);
      const goodSoFar = this._playSequence.every(
        (playedColor, i) => this.sequence[i] === playedColor
      );
      if (!goodSoFar) {
        this.openModal();
      } else {
        if (this.playSequence.length === this.sequence.length) {
          this._nextRound.next(this.state.level + 1);
        }
      }
    }
  }
  /**
   * Injected styles for modal end game window
   */
  modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)"
    }
  };

  /**
   * React Ctor
   * @param {} props props injected (none)
   */
  constructor(props) {
    //call parent constructor
    super(props);
    //initiate local state
    this.state = {
      playing: false,
      level: 0,
      best: 0,
      showModal: false
    };
    //initiate howl object (see https://howlerjs.com/docs for more info)
    this._howl = new Howl({
      // defining audio source
      src: ["simon-sound.mp3"],
      // defining sprites to be played
      sprite: {
        green: [0, 295],
        red: [296, 297],
        yellow: [595, 271],
        blue: [866, 321]
      },
      // callback when audio finishes => emits _endplay value
      onend: () => this._endPlay.next(),
      // suscribing to subjects once audio file is loaded
      onload: () => {
        this._blinkGreen.pipe(throttleTime(500)).subscribe(isClick => {
          this.blinkingColor = "green";
          this.handleBlink(isClick);
        });
        this._blinkRed.pipe(throttleTime(500)).subscribe(isClick => {
          this.blinkingColor = "red";
          this.handleBlink(isClick);
        });
        this._blinkYellow.pipe(throttleTime(500)).subscribe(isClick => {
          this.blinkingColor = "yellow";
          this.handleBlink(isClick);
        });
        this._blinkBlue.pipe(throttleTime(500)).subscribe(isClick => {
          this.blinkingColor = "blue";
          this.handleBlink(isClick);
        });
        this._endPlay.subscribe(() => {
          switch (this.blinkingColor) {
            case "green":
              this.toggleBlinking("green");
              break;
            case "red":
              this.toggleBlinking("red");
              break;
            case "blue":
              this.toggleBlinking("blue");
              break;
            case "yellow":
              this.toggleBlinking("yellow");
              break;
            default:
              break;
          }
          this.blinkingColor = null;
        });
      },
      onloaderror: () => {
        // TODO handle load error
      }
    });
    //binding endGame callback for modal usage
    this.endGame = this.endGame.bind(this);
  }

  /**
   * @method handleBlink
   * @param isClick indicates if user has clicked or if Simon emitted sound
   */
  handleBlink(isClick) {
    this._howl.play(this.blinkingColor);
    this.toggleBlinking(this.blinkingColor);
    if (isClick) {
      this.playSequence = [...this.playSequence, this.blinkingColor];
    }
  }
  /**
   * @method clickGreen
   * fired when user clicks green tile
   */
  clickGreen() {
    this._blinkGreen.next(true);
  }
  /**
   * @method clickRed
   * fired when user clicks red tile
   */
  clickRed() {
    this._blinkRed.next(true);
  }

  /**
   * @method clickYellow
   * fired when user clicks yellow tile
   */
  clickYellow() {
    this._blinkYellow.next(true);
  }

  /**
   * @method clickBlue
   * fired when user clicks blue tile
   */
  clickBlue() {
    this._blinkBlue.next(true);
  }

  /**
   * @method toggleBlinking
   * toggle class 'blinking' to element to be blinked
   */
  toggleBlinking(name) {
    document.getElementById(name).classList.toggle("blinking");
  }

  /**
   * @method startGame
   * initiates game state when user clicks 'Start'
   */
  startGame() {
    this._nextRound = new Subject();
    this._nextRound.subscribe(level => {
      this.playSequence = [];
      this.computeSequence();
      this.setState({
        ...this.state,
        playing: true,
        level: level
      });
    });
    this._nextRound.next(1);
  }
  /**
   * @method resetGame
   * resets game state when user clicks 'Reset'
   */
  resetGame() {
    this.setState({
      playing: false,
      level: 0,
      best: 0
    });
    // handle subscription
    if (this._nextRound && !this._nextRound.isStopped) {
      this._nextRound.unsubscribe();
    }
    this.sequence = [];
    this.playSequence = [];
  }
  /**
   * @method endGame
   * sets game state when user closes end game modal
   */
  endGame() {
    let best = this.state.best;
    if (best < this.state.level) {
      best = this.state.level;
    }
    this.setState({
      playing: false,
      level: 0,
      best: best,
      showModal: false
    });
    this._nextRound.unsubscribe();
    this.sequence = [];
    this.playSequence = [];
  }

  /**
   * @method computeSequence
   * computes a color to be played and adds it to the sequence
   */
  computeSequence() {
    let newColor = "";
    switch (Math.floor(Math.random() * Math.floor(4))) {
      case 0:
        newColor = "green";
        break;
      case 1:
        newColor = "red";
        break;
      case 2:
        newColor = "yellow";
        break;
      case 3:
        newColor = "blue";
        break;
      default:
        break;
    }
    console.log("newColor :", newColor);
    this.sequence = [...this._sequence, newColor];
  }
  /**
   * @method openModal
   * opens modal end game window
   */
  openModal() {
    this.setState({ showModal: true });
  }
  /**
   * @method render
   * renders Simon game.
   */
  render() {
    return (
      <div id="simon-wrapper">
        <div
          id="frame"
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <div
            id="upper"
            className="d-inline-flex justify-content center align-items-stretch"
          >
            <div id="green" className="m-1" onClick={() => this.clickGreen()} />
            <div id="red" className="m-1" onClick={() => this.clickRed()} />
          </div>
          <div
            id="lower"
            className="d-inline-flex justify-content center align-items-stretch"
          >
            <div
              id="yellow"
              className="m-1"
              onClick={() => this.clickYellow()}
            />
            <div id="blue" className="m-1" onClick={() => this.clickBlue()} />
          </div>
        </div>
        <div
          id="center"
          className="p-1 d-flex flex-column justify-content-around align-items-center"
        >
          <div className="label d-flex justify-content-space-between align-items-center">
            <span>Round :</span>
            <div className="digital-counter">{"" + this.state.level}</div>
          </div>
          <div className="label d-flex justify-content-space-between align-items-center">
            <span>Best :</span>
            <div className="digital-counter">{this.state.best}</div>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <button className="button mr-1" onClick={() => this.resetGame()}>
              Reset
            </button>
            <button
              className="button"
              onClick={() => this.startGame()}
              disabled={this.state.playing}
            >
              Start
            </button>
          </div>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.showModal}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.modalStyles}
          contentLabel="Example Modal"
        >
          <h2>Fin de partie</h2>
          <p>
            Vous avez réussi à suivre la séquence de Simon {this.state.level}{" "}
            fois d'affilée.
          </p>
          <button className="btn btn-primary" onClick={this.endGame}>
            Fermer
          </button>
        </Modal>
      </div>
    );
  }
}
