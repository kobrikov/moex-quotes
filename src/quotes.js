'use strict';

(function () {
  var TICKERS = ['AFLT', 'AKRN', 'ALRS', 'AVAZ', 'BSPB', 'CHMF', 'FEES', 'GAZP', 'GMKN', 'IRAO', 'KMAZ', 'LKOH', 'LNZL', 'LSRG', 'MAGN', 'MFON', 'MGNT', 'MOEX', 'MSNG', 'MSTT', 'MTSS', 'NVTK', 'OGKB', 'PHOR', 'PLZL', 'POLY', 'ROSN', 'RSTI', 'RTKM', 'RUAL', 'SBER', 'UNAC', 'VTBR', 'YNDX', 'ENRU'];
  var TIME_INTERVAL = 5000;
  var template = document.querySelector('#quotes-template').content;
  var container = document.querySelector('.quotes__inner');

  var load = function (object, json) {
    var securities = json.securities.data[0];
    var marketdata = json.marketdata.data[0];
    var indexofName = json.securities.columns.indexOf('SHORTNAME');
    var indexofPrevprice = json.securities.columns.indexOf('PREVPRICE');
    var indexofSize = json.securities.columns.indexOf('LOTSIZE');
    var indexofLast = json.marketdata.columns.indexOf('LAST');
    var indexofChange = json.marketdata.columns.indexOf('CHANGE');
    var indexofPercent = json.marketdata.columns.indexOf('LASTTOPREVPRICE');
    object.name = securities[indexofName];
    object.prevprice = securities[indexofPrevprice];
    object.size = securities[indexofSize];
    object.last = marketdata[indexofLast] || object.prevprice;
    object.change = marketdata[indexofChange] || '0';
    object.percent = marketdata[indexofPercent].toFixed(2) + '%';
    object.renderChange();
  };

  var error = function (message) {
    console.log(message);
  };

  var dataFrom = function (currentObject, onLoad, onError) {
    var url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/' + currentObject.ticker + '.json?iss.meta=off';
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {
      if (xhr.status === 200) {
        onLoad(currentObject, xhr.response);
      } else {
        onError('Неизвестный статус: ' + xhr.status + ' ' + xhr.statusText);
      }
    });
    xhr.open('GET', url);
    xhr.send();
  };

  var getColor = function (number) {
    switch (Math.sign(number)) {
      case -1:
        return 'rgba(255, 74, 104, 1)';
      case 1:
        return 'rgba(60, 188, 152, 1)';
      default:
        return 'rgba(225, 236, 242, 1)';
    }
  };

  var MOEXElement = function (ticker) {
    this.ticker = ticker;
  };

  MOEXElement.prototype = {
    loadData: function () {
      setInterval(function () {
        dataFrom(this, load, error);
      }.bind(this), TIME_INTERVAL);
    },
    create: function () {
      var newBox = template.cloneNode(true);
      newBox.querySelector('.quotes__ticker').textContent = this.ticker;
      newBox.querySelector('.quotes__item').classList.add('quotes__item--' + this.ticker);
      container.appendChild(newBox);
    },
    renderChange: function () {
      var changeQuotes = container.querySelector('.quotes__item--' + this.ticker);
      changeQuotes.querySelector('.quotes__name').textContent = this.name;
      changeQuotes.querySelector('.quotes__size').textContent = this.size;
      changeQuotes.querySelector('.quotes__prevprice').textContent = this.prevprice.toString().replace('.', ',');
      changeQuotes.querySelector('.quotes__price span').textContent = this.last.toString().replace('.', ',');
      changeQuotes.querySelector('.quotes__currency').textContent = this.change.toString().replace('.', ',');
      changeQuotes.querySelector('.quotes__percent').textContent = this.percent.toString().replace('.', ',');
      var color = getColor(this.change);
      changeQuotes.querySelector('.quotes__price span').style.color = color;
      changeQuotes.querySelector('.quotes__currency').style.color = color;
      changeQuotes.querySelector('.quotes__percent').style.color = color;
    },
    start: function () {
      this.create();
      this.loadData();
    }
  };

  TICKERS.sort().forEach(function (element, index) {
    new MOEXElement(element).start();
  });
})();
