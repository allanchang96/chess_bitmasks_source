/* Creates an interactive webpage where clicking on chess bitboard
 * generates the twos complement equivalent for the bitboard
 * https://github.com/SFU-Open-Source-Development/chess-engine
 * Useful to quickly generate bitmasks visually
 *
 * Author: Allan Chang
 *
 * Original code: 
 * Source: https://reactjs.org/tutorial/tutorial.html
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function stringAdd(a, b){
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let res = "";
  while(i >= 0 || j >= 0 || carry){
    let sum = 0;
    if(i >= 0){
      sum += a[i] - '0';
    }
    if(j >= 0){
      sum += b[j] - '0';
    }
    sum += carry;
    if(sum >= 10){
      carry = 1;
      sum -= 10;
    }
    else{
      carry = 0;
    }
    i--;
    j--;
    res = sum + res;
  }
  return res;
}

function stringSubtract(a, b){
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let res = "";
  while(i >= 0){
    let sub = carry + (a[i] - '0');
    carry = 0;
    if(j >= 0){
      sub -= b[j] - '0';
    }
    if(sub < 0){
      sub += 10;
      carry = -1;
    }
    i--;
    j--;
    res = sub + res;
  }
  let removeZeros = 0;
  while(res[removeZeros] === "0"){
    removeZeros++;
  }
  return removeZeros === res.length ? "0" : res.substring(removeZeros);
}

// Compute the value of the bit
let values = ['1'];
for(let i = 1; i < 64; i++){
  values.push(stringAdd(values[i - 1], values[i - 1]));
}

function Square(props){

  let color = 'white';
  // get row number
  let row = Math.floor(props.value / 8);
  if(props.click[props.value]){
    color = 'red';
  }
  else if((row % 2 === 0 && props.value % 2 === 1) || (row % 2 === 1 && props.value % 2 === 0)){
    color = 'grey';
  }
  return (
    <button 
      className = 'square' 
      onClick = {props.onClick}
      style = {{backgroundColor: color}}>
    </button>
  )
}

function Label(props){
  return (
    <div
      className ='square'
      style = {{border: 0, zIndex: -1}}>
        {props.value}
    </div>
  )
}

class Board extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      click: Array(64).fill(false),
      number: 0,
    }
  }

  clear(){
    this.setState({
      click : Array(64).fill(false),
      number : 0,
    });
  }

  handleChange(event){
    let arr = Array(64).fill(false);
    let val = event.target.value;
    let negative = false;
    if(val[0] === '-'){
      negative = true;
      arr[63] = true;
      // Set up twos complement negative value
      val = val.substring(1);
      val = stringSubtract(val, "1");
    }
    for(let i = 62; i >= 0; i--){
      // Only enter, if string is longer in length OR if equal in length and val is larger
      if(val.length > values[i].length || ((val.length === values[i].length) && (val >= values[i]))){
        val = stringSubtract(val, values[i]);
        if(!negative){
          arr[i] = true;
        }
      }
      else if(negative){
        arr[i] = true;
      }
    }
    if(val !== "0"){
      arr = Array(64).fill(false);
    }
    this.setState({
      click : arr,
      number : event.target.value,
    });
  }

  computeSum(arr){
    // Compute twos complement
    let sum = '0';
    let negative = arr[63];
    if(!negative){
      for(let i = 0; i < 63; i++){
        if(arr[i]){
          sum = stringAdd(sum, values[i]);
        }
      }
    }
    else{
      for(let i = 0; i < 63; i++){
        if(!arr[i]){
          sum = stringAdd(sum, values[i]);
        }
      }
      sum = stringAdd(sum, '1');
      sum = '-' + sum;
    }
    return sum;
  }

  renderLabel(i){
    return <Label
      key = {i}
      value = {i}
      />
  }

  renderSquare(i){
    return <Square
    key = {i}
    value = {i}
    click = {this.state.click}
    onClick = {() => {
      let newClick = this.state.click.slice();
      newClick[i] = !newClick[i];
      let sum = this.computeSum(newClick);
      this.setState({
        click : newClick,
        number : sum,
      })
    }}
    />;
  }

  render() {

    // Set up the board
    let buffer = [];
    for(let i = 0; i < 8; i++){
      let component = [];
      for(let j = 0; j < 8; j++){
        component.push(this.renderSquare(8 * i + j));
      }
      component.push(this.renderLabel(8 - i));
      buffer.push(<div className='board-row' key={i}>{component}</div>)
    }
    let alphaLabel = [];
    for(let i = 0; i < 8; i++){
      alphaLabel.push(this.renderLabel(String.fromCharCode(i + 'a'.charCodeAt(0))));
    }
    buffer.push(<div className='board-row' key={8}>{alphaLabel}</div>)

    let res = <div>
      <div className = 'board'>{buffer}</div>
      <input type="number" style={{width:"250px"}} value={this.state.number} onChange={(e) => {this.handleChange(e);}}/>
      <div><button onClick = {() => this.clear()}>CLEAR</button></div>
    </div>
    return res;
  }
}

// ========================================

ReactDOM.render(
  <Board />,
  document.getElementById('root')
);