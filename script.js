const LOAD_AMOUNT = 30;
const npmPackage = Vue.component('npm-package', {
  props: {
    word: String,
    score: Number,
    from: String,
    onlyAvailable: Boolean,
  },
  data: function() {
    return {
      loading: true,
      avalability: null,
      rawInfo: {},
      modalInfoOpened: false,
    };
  },
  computed: {
    info() {
      return this.rawInfo;
    },
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
      console.log('aer');
    }
    this.loading = false;
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
        `http://cors-anywhere.herokuapp.com/http://relatedwords.org/api/related?term=${word}`
      )
        .then(e => e.json())
        .then(e => {
          if (!e.error) this.allWords = e;
          this.fetchingWords = false;
        });
    }, 500),
    loadMore: function() {
      this.skip += Math.min(LOAD_AMOUNT, this.allWords.length);
      console.log('loaded more', this.skip);
    },
  },
  components: {
    npmPackage,
  },
});
