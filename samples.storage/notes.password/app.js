

import * as DB from "notesdb.js";
import md2htm from "../../samples.sciter/virtual-list/snarkdown/index.js";

class NoteList extends Element {

  // note: in reality that should be virtual list.

  constructor() {
    super();
    document.on("new-note", () => this.componentUpdate());
  }

  render() {

    var list = [];


    for(let note of DB.Note.all()) {
      console.assert(note instanceof DB.Note);
      list.push(<div.note key={note.id}>
          <header>{note.date.toLocaleString()}</header>
          <div.text state-html={md2htm(note.text)} /></div>);
    }
    return <section>{list}</section>
  }
}

class NewNote extends Element {

  render() {
    return <form>
      <plaintext novalue="type Markdown text here" />
      <button disabled="">Add</button>
    </form>;
  }

  ["on input at plaintext"](evt,plaintext) {
    this.$("button").state.disabled = !plaintext.value;
  }
  ["on click at button"](evt,button) {
    let plaintext = this.$("plaintext");
    new DB.Note(plaintext.value);
    plaintext.value = "";
  }

}

export class App extends Element {

  loggedIn = null;

  constructor({password}) {
    super();
    this.loggedIn = DB.open(password);
  }

  render() {
     return this.loggedIn ? <main><NoteList #list /><NewNote #new /></main>
                          : <div.error>Error opening database</div>;

  }

  componentWillUnmount() {
    DB.close(); 
  }

} 
