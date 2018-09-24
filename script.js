const LOAD_AMOUNT = 30;
const npmPackage = Vue.component('npm-package', {
  props: {
    word: String,
    score: Number,
    from: String,
    onlyAvailable: Boolean,
  },
  mounted: async function() {
    try {
      let res = await fetch(
        `http://cors-anywhere.herokuapp.com/https://registry.npmjs.org/${
          this.word
        }
    `,
        {
          origin: null,
        }
      );
      res = await res.json();
      if (res.error) this.avalability = true;
      else this.avalability = false;
      this.rawInfo = res;
    } catch (e) {
      this.avalability = true;
    }
    this.loading = false;
  },
  data: function() {
    return {
      loading: true,
      avalability: null,
      rawInfo: {},
      modalInfoOpened: false,
      clicked: false,
    };
  },
  computed: {
    info() {
      return this.rawInfo;
    },
    borderOpacity() {
      const { score } = this;
      if (score > 7) return 1;
      else if (score > 3) return 0.5;
      else if (score > 1) return 0.3;
      return 0.1;
    },
    borderWidth() {
      const { score } = this;

      if (score > 10) return 2;
      if (score < 1) return 0;
      return 1;
    },
  },
  methods: {
    clickAvailble() {
      if (this.avalability) {
        copyToClipboard(this.word);
        this.clicked = !this.clicked;
        if (this.clicked) {
          setTimeout(() => (this.clicked = false), 1000);
        }
      }
    },
  },
  name: 'npm-package',
  template: '#npm-package',
});
const app = new Vue({
  el: '#app',
  data: {
    allWords: [],
    fetchingWords: false,
    onlyAvailable: false,
    searchString: '',
    skip: 0,
  },
  computed: {
    words: function() {
      return this.allWords.slice(0, LOAD_AMOUNT + this.skip).map(e => {
        e.word = e.word.replace(/ /g, '-');
        return e;
      });
    },
    loadedAll: function() {
      return this.skip + LOAD_AMOUNT >= this.allWords.length;
    },
  },
  methods: {
    getRelatedWords: _.debounce(function(word) {
      this.allWords = [];
      if (!this.searchString.trim()) {
        return;
      }
      this.fetchingWords = true;
      fetch(
        `http://cors-anywhere.herokuapp.com/http://relatedwords.org/api/related?term=${word}`,
        { origin: null }
      )
        .then(e => e.json())
        .then(e => {
          if (!e.error) this.allWords = e;
          this.fetchingWords = false;
        });
    }, 500),
    loadMore: function() {
      this.skip += Math.min(LOAD_AMOUNT, this.allWords.length);
    },
  },
  components: {
    npmPackage,
  },
});

// Copy to clipboard, from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f

const copyToClipboard = str => {
  const el = document.createElement('textarea'); // Create a <textarea> element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px'; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
    document.getSelection().addRange(selected); // Restore the original selection
  }
};
