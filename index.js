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

class Display extends React.Component {

  computeBinary(){
    let res = "";
    for(const i of this.props.click){
      res += i ? "1" : "0";
    }
    return res;
  }
  
  computeHex(){
    let res = "";
    for(let i = 0; i < 63; i += 4){
      let sum = 0;
      sum += (this.props.click[i] - '0') * 8;
      sum += (this.props.click[i + 1] - '0') * 4;
      sum += (this.props.click[i + 2] - '0') * 2;
      sum += (this.props.click[i + 3] - '0');
      res += sum.toString(16)
    }
    return res.toUpperCase();
  }

  computeSum(){
    // Compute twos complement
    let sum = "0";
    let negative = this.props.click[63];
    if(!negative){
      for(let i = 0; i < 63; i++){
        if(this.props.click[i]){
          sum = stringAdd(sum, values[i]);
        }
      }
    }
    else{
      for(let i = 0; i < 63; i++){
        if(!this.props.click[i]){
          sum = stringAdd(sum, values[i]);
        }
      }
      sum = stringAdd(sum, "1");
      sum = '-' + sum;
    }
    return sum;
  }

  render(){
    let input;
    if(this.props.name === "Binary"){
      if(this.props.type === "bin"){
        input = <input type="text" style={{width:"500px"}} value={this.props.number} onChange={(e) => {this.props.change(e);}}/>
      }
      else{
        input = <input type="text" style={{width:"500px"}} value={this.computeBinary()} onChange={(e) => {this.props.change(e);}}/>
      }
    }
    else if(this.props.name === "Hexadecimal"){
      if(this.props.type === "hex"){
        input = <input type="text" style={{width:"500px"}} value={this.props.number} onChange={(e) => {this.props.change(e);}}/>
      }
      else{
        input = <input type="text" style={{width:"500px"}} value={this.computeHex()} onChange={(e) => {this.props.change(e);}}/>
      }
    }
    else if(this.props.name === "Decimal"){
      if(this.props.type === "dec"){
        input = <input type="text" style={{width:"500px"}} value={this.props.number} onChange={(e) => {this.props.change(e);}}/>
      }
      else{
        input = <input type="text" style={{width:"500px"}} value={this.computeSum()} onChange={(e) => {this.props.change(e);}}/>
      }
    }
    return (
      <div>
        <div>{this.props.name}</div>{input}
      </div>
    )
  }


}

class Board extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      click: Array(64).fill(false),
      type: "",
      number: "0",
    }
  }

  clear(){
    this.setState({
      click : Array(64).fill(false),
      type : "",
    });
  }

  isHex(e){
    let c = e.toUpperCase();
    if((c >= "0" && c <= "9") || (c >= "A" && c <= "F")){
      return true;
    }
    return false;
  }

  convertHex(e){
    let val = parseInt(e, 16);
    let res = "";
    if(val >= 8){
      val -= 8;
      res += "1";
    }
    else{
      res += "0";
    }
    if(val >= 4){
      val -= 4;
      res += "1";
    }
    else{
      res += "0";
    }
    if(val >= 2){
      val -= 2;
      res += "1";
    }
    else{
      res += "0";
    }
    if(val >= 1){
      val -= 1;
      res += "1";
    }
    else{
      res += "0";
    }
    return res;
  }

  handleChange(event){
    let arr = Array(64).fill(false);
    let val = event.target.value;
    // validate
    let validate = true;
    if(val.length === 0){
      validate = false;
    }
    else{
      if((val[0] < "0" || val[0] > "9") && val[0] !== "-"){
        validate = false;
      }
      else if(val[0] === "-" && val.length === 1){
        validate = false;
      }
      else{
        for(let i = 1; i < val.length; i++){
          if(val[i] < "0" || val[i] > "9"){
            validate = false;
            break;
          }
        }
      }
    }
    console.log(validate);
    if(validate){
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
    }
    this.setState({
      click : arr,
      type : "dec",
      number : event.target.value,
    });
  }

  handleChangeBin(event){
    let arr = Array(64).fill(false);
    // validate
    let val = event.target.value;
    let validate = true;
    if(val.length > 0 && val.length <= 64){
      for(let i = 0; i < val.length; i++){
        if(val[i] < "0" || val[i] > "1"){
          validate = false;
          break;
        }
      }
    }
    else{
      validate = false;
    }
    if(validate){
      let counter = 0;
      for(let i = val.length - 1; i >= 0; i--){
        if(val[i] === "1"){
          arr[63 - counter] = true;
        }
        counter++;
      }
    }
    this.setState({
      click : arr,
      type : "bin",
      number : val,
    });
  }

  handleChangeHex(event){
    let arr = Array(64).fill(false);
    // validate
    let val = event.target.value;
    let validate = true;
    if(val.length > 0 && val.length <= 16){
      for(let i = 0; i < val.length; i++){
        if(!this.isHex(val[i])){
          validate = false;
          break;
        }
      }
    }
    else{
      validate = false;
    }
    if(validate){
      let counter = 0;
      for(let i = val.length - 1; i >= 0; i--){
        let bin = this.convertHex(val[i]);
        for(let j = 0; j < bin.length; j++){
          if(bin[j] === "1"){
            arr[63 - counter - 3 + j] = true;
          }
        }
        counter += 4;
      }
    }
    this.setState({
      click : arr,
      type : "hex",
      number : event.target.value,
    });
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
      this.setState({
        click : newClick,
        type : "",
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

    let res = 
    <div>
      <div className = 'board'>{buffer}</div>
      <Display name = "Binary" number = {this.state.number} click = {this.state.click} type = {this.state.type} change = {(e) => {this.handleChangeBin(e);}}/>
      <Display name = "Hexadecimal" number = {this.state.number} click = {this.state.click} type = {this.state.type} change = {(e) => {this.handleChangeHex(e);}}/>
      <Display name = "Decimal" number = {this.state.number} click = {this.state.click} type = {this.state.type} change = {(e) => {this.handleChange(e);}}/>
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