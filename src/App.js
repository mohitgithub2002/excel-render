import React, { Component } from "react";
import "./App.css";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import ReactDatatable from '@ashvin27/react-datatable'
import config from "./coreFiles/config";
import {
     Jumbotron,
     Col,
     Input,
     InputGroup,
     InputGroupAddon,
     FormGroup,
     Label,
     Button,
     Fade,
     FormFeedback,
     Container,
     Card,
} from "reactstrap";
import TableData from "./components/TableData";
import Web3 from "web3";

class App extends Component {
     constructor(props) {
          super(props);
          this.state = {
               isOpen: false,
               dataLoaded: false,
               isFormInvalid: false,
               rows: null,
               startButton: false,
               rowSize: 0,
               cols: [{ name: "Sr No.", key: 0 },
               { name: "To Token", key: 1 },
               { name: "From Token", key: 2 },
               { name: "Swap amount", key: 3 },
               { name: "Address", key: 4 },
               { name: "Private Key", key: 5 },
               { name: "Time", key: 6 }],
          };
          this.fileHandler = this.fileHandler.bind(this);
          this.toggle = this.toggle.bind(this);
          this.openFileBrowser = this.openFileBrowser.bind(this);
          this.renderFile = this.renderFile.bind(this);
          this.openNewPage = this.openNewPage.bind(this);
          this.fileInput = React.createRef();
     }

     renderFile = (fileObj) => {
          //just pass the fileObj as parameter
          ExcelRenderer(fileObj, (err, resp) => {
               if (err) {
                    console.log(err);
               } else {
                    console.log(resp.rows[0].length)
                    let rowSize = resp.rows[0].length;
                    this.setState({ rowSize: rowSize })
                    for (let i = 0; i < resp.rows.length; i++) {
                         resp.rows[i][rowSize] = "Start";

                    }
                    this.setState({ startButton: true })
                    this.setState({
                         dataLoaded: true,
                         //   cols: resp.cols,
                         rows: resp.rows,
                    });
               }
          });
     };

     fileHandler = (event) => {
          if (event.target.files.length) {
               let fileObj = event.target.files[0];
               let fileName = fileObj.name;

               //check for file extension and pass only if it is .xlsx and display error message otherwise
               if (fileName.slice(fileName.lastIndexOf(".") + 1) === "xlsx") {
                    this.setState({
                         uploadedFileName: fileName,
                         isFormInvalid: false,
                    });
                    this.renderFile(fileObj);
               } else {
                    this.setState({
                         isFormInvalid: true,
                         uploadedFileName: "",
                    });
               }
          }
     };

     actionCall = async (e, i) => {
          e.preventDefault()
          let oldRow = this.state.rows
          let rowSize = this.state.rowSize
          oldRow[i][rowSize] = 'Stoped'
          this.setState({ row: oldRow })

     }

     startTransactions = async (e) => {
          e.preventDefault()

          const web3 = new Web3(window.ethereum);
          web3.setProvider(
               new web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/")
             );
          
          const ContractObj = new web3.eth.Contract(
               config.swapABI, config.swapContact
          );

          let oldRow = this.state.rows

          let rowSize = this.state.rowSize

          for (let i = 0; i < this.state.rows.length; i++) {
               if (i > 0) {
                    oldRow[i][rowSize - 1] = oldRow[i - 1][rowSize - 1] + oldRow[i][rowSize - 1]
               }
          }

          for (let i = 0; i < this.state.rows.length; i++) {
             let time = oldRow[i][rowSize - 1]
             time = parseInt((time * 60)* 1000)
               oldRow[i][rowSize] = 'Stop'
               this.setState({ row: oldRow })
               setTimeout(async () => {
                
                    if (this.state.rows[i][rowSize] == 'Stoped') {
                         console.log(i + 1, "Stoped")
                         oldRow[i][rowSize] = 'Stoped'
                    } else {

                         let amount = oldRow[i][2];
                         let pair = [oldRow[i][0], oldRow[i][1]];
                         let account = oldRow[i][3];
                         let privateKey = oldRow[i][4];

                         let balance = await web3.eth.getBalance(account)
                         balance = (balance * 10**18).toLocaleString("fullwide", {
      useGrouping: false,
    });
                         amount =  (amount * 10**18).toLocaleString("fullwide", {
      useGrouping: false,
    });
                         if (balance  > amount) {

                              oldRow[i][rowSize] = 'Pending'
                              this.setState({ row: oldRow })


                              let getAmountsOut = await ContractObj.methods.getAmountsOut(amount.toString(), pair).call();

                              let tx_builder = await ContractObj.methods.swapETHForExactTokens(getAmountsOut[1], pair, account, '16000000000000');
                              let encoded_tx = tx_builder.encodeABI();


                              let gasPrice = await web3.eth.getGasPrice();
                              let gasLimit = await web3.eth.estimateGas({
                                   gasPrice: web3.utils.toHex(gasPrice),
                                   to: config.swapContact,
                                   from: account,
                                   data: encoded_tx,
                                   value: amount
                              });


                              const transactionObject = {
                                   gasPrice: web3.utils.toHex(gasPrice),
                                   gas: web3.utils.toHex(gasLimit),
                                   to: config.swapContact,
                                   from: account,
                                   data: encoded_tx,
                                   value: amount

                              };


                              await web3.eth.accounts
                                   .signTransaction(transactionObject, privateKey)
                                   .then(async (signedTx) => {

                                        await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (
                                             err,
                                             hash
                                        ) {

                                             if (!err) {
                                                  console.log(i + 1)
                                                  console.log(hash)

                                                  oldRow[i][rowSize] = 'Completed'


                                             } else {
                                                  console.log(i)
                                                  console.log(err)
                                                  oldRow[i][rowSize] = err.msg



                                             }
                                        });
                                   })
                                   .catch((err) => {
                                        oldRow[i][rowSize] = err.msg
                                   });
                              this.setState({ row: oldRow })

                         } else {
                              oldRow[i][rowSize] = 'insufficient Balance'
                              this.setState({ row: oldRow })

                         }
                    }



               }, time)
          }


     }

     columns = [
          {
               key: "Sno.",
               text: "Sno.",
               cell: (row, index) => index + 1
          },
          {
               key: "To Token",
               text: "To Token",
               cell: (row, index) => row[0].toString().substring(0, 4) + '...' + row[0].toString().substr(row[0].length - 4)
          },
          {
               key: "From Token",
               text: "From Token",
               cell: (row, index) => row[1].toString().substring(0, 4) + '...' + row[1].toString().substr(row[1].length - 4)
          },
          {
               key: "Swap amount",
               text: "Swap amount",
               cell: (row, index) => row[2]
          },
          {
               key: "Address",
               text: "Address",
               cell: (row, index) => row[3].toString().substring(0, 4) + '...' + row[3].toString().substr(row[3].length - 4)
          },
          {
               key: "Private Key",
               text: "Private Key",
               cell: (row, index) => row[4].toString().substring(0, 4) + '...' + row[4].toString().substr(row[4].length - 4)
          },
          {
               key: "Time",
               text: "Time",
               cell: (row, index) => row[5]
          },
          {
               key: "Action",
               text: "Action",
               cell: (row, index) => {
                    return (
                         <button className={
                              row[6] == 'Stop'
                                   ?
                                   "btn btn-warning"
                                   :
                                   row[6] == 'Stoped'
                                        ?
                                        "btn btn-secondary"
                                        :
                                        row[6] == 'Completed'
                                             ?
                                             "btn btn-success"
                                             :
                                             row[6] == 'Start'
                                             ?
                                             "btn btn-primary"
                                             :
                                             "btn btn-danger"
                         } onClick={e => { this.actionCall(e, index) }}
                              disabled={row[6] == 'Stop' ? false : true}
                         >{row[6]}</button>
                    );
               }
          },


     ];
     toggle() {
          this.setState({
               isOpen: !this.state.isOpen,
          });
     }


     openFileBrowser = () => {
          this.fileInput.current.click();
     };

     openNewPage = (chosenItem) => {
          const url =
               chosenItem === "github"
                    ? "https://github.com/ashishd751/react-excel-renderer"
                    : "https://medium.com/@ashishd751/render-and-display-excel-sheets-on-webpage-using-react-js-af785a5db6a7";
          window.open(url, "_blank");
     };

     configForTable = {
          page_size: 10,
          length_menu: [10, 20, 50],
          show_filter: true,
          show_pagination: true,
          pagination: 'advance',
          button: {
               excel: true,
               print: false

          }
     }

     render() {
          return (
               <div>
                    <div>
                         <Jumbotron className="jumbotron-background">
                              <h1 className="display-3">Pancake swaping</h1>
                              <p className="lead">
                                   Welcome to the pancakeswap demo.
                              </p>
                              <hr className="my-2" />
                         </Jumbotron>
                    </div>
                    <Container>
                         <form>
                              <FormGroup row>
                                   <Label
                                        for="exampleFile"
                                        xs={6}
                                        sm={4}
                                        lg={2}
                                        size="lg"
                                   >
                                        Upload
                                   </Label>
                                   <Col xs={4} sm={8} lg={10}>
                                        <InputGroup>
                                             <InputGroupAddon addonType="prepend">
                                                  <Button
                                                       color="info"
                                                       style={{
                                                            color: "white",
                                                            zIndex: 0,
                                                       }}
                                                       onClick={this.openFileBrowser.bind(
                                                            this
                                                       )}
                                                  >
                                                       <i className="cui-file" />{" "}
                                                       Browse&hellip;
                                                  </Button>
                                                  <input
                                                       type="file"
                                                       hidden
                                                       onChange={this.fileHandler.bind(
                                                            this
                                                       )}
                                                       ref={this.fileInput}
                                                       onClick={(event) => {
                                                            event.target.value = null;
                                                       }}
                                                       style={{
                                                            padding: "10px",
                                                       }}
                                                  />
                                             </InputGroupAddon>
                                             <Input
                                                  type="text"
                                                  className="form-control"
                                                  value={
                                                       this.state
                                                            .uploadedFileName
                                                  }
                                                  readOnly
                                                  invalid={
                                                       this.state.isFormInvalid
                                                  }
                                             />
                                             <FormFeedback>
                                                  <Fade
                                                       in={
                                                            this.state
                                                                 .isFormInvalid
                                                       }
                                                       tag="h6"
                                                       style={{
                                                            fontStyle: "italic",
                                                       }}
                                                  >
                                                       Please select a .xlsx
                                                       file only !
                                                  </Fade>
                                             </FormFeedback>
                                        </InputGroup>
                                   </Col>
                              </FormGroup>
                         </form>

                         {this.state.dataLoaded && (
                              <div>

                                   {/* <OutTable
                                             data={this.state.rows}
                                             columns={this.columns}//{this.state.cols}
                                             tableClassName="ExcelTable2007"
                                             tableHeaderRowClass="heading"
                                        /> */}
                                   <ReactDatatable
                                        config={this.configForTable}
                                        records={this.state.rows}
                                        columns={this.columns}
                                   />

                              </div>
                         )}
                    </Container>
                    {this.state.startButton && <div className="text-center">
                         <button class="btn btn-primary btn-lg" onClick={e => { this.startTransactions(e) }}>START</button>
                    </div>}

               </div>
          );
     }
}

export default App;
