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


function Square(props){
  // Generate checker pattern
  let checkerPattern = Array(64).fill('white');
  for(let i = 0; i < 8; i++){
    const start = (i % 2) ? 0 : 1
    for(let j = start; j < 8; j += 2){
      checkerPattern[8 * i + j] = 'grey';
    }
  }
  // Check highlighted squares
  for(let i = 0; i < 64; i++){
    if(props.click[i]){
      checkerPattern[i] = 'red';
    }
  }
  return (
    <button 
      className = "square" 
      onClick = {props.onClick}
      style = {{backgroundColor: checkerPattern[props.value]}}>
    </button>
  )
}

class Board extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      click: Array(64).fill(false),
    }
  }

  stringAdd(a, b){
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

  clear(){
    this.setState({
      click : Array(64).fill(false),
    });
  }

  renderSquare(i){
    return <Square
    key = {i}
    value = {i}
    click = {this.state.click}
    onClick = {() => {
      let newClick = this.state.click.slice();
      newClick[i] = !newClick[i];
      this.setState({
        click : newClick,
      })
    }}
    />;
  }

  render() {
    // Compute the value of the bit
    let values = ['1'];
    for(let i = 1; i < 64; i++){
      values.push(this.stringAdd(values[i - 1], values[i - 1]));
    }

    // Set up the board
    let buffer = [];
    for(let i = 0; i < 8; i++){
      let component = [];
      for(let j = 0; j < 8; j++){
        component.push(this.renderSquare(8 * i + j));
      }
      buffer.push(<div className='board-row' key={i}>{component}</div>)
    }

    // Compute twos complement
    let sum = '0';
    let negative = this.state.click[63];
    if(!negative){
      for(let i = 0; i < 63; i++){
        if(this.state.click[i]){
          sum = this.stringAdd(sum, values[i]);
        }
      }
    }
    else{
      for(let i = 0; i < 63; i++){
        if(!this.state.click[i]){
          sum = this.stringAdd(sum, values[i]);
        }
      }
      sum = this.stringAdd(sum, '1');
      sum = '-' + sum;
    }
    let res = <div>
      {buffer}
      <div>{sum}</div>
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
