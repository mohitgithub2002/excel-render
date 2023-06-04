import React, { Component } from "react";

export default class TableData extends Component {
     render() {
          return (
               <div className="table_style">
                    <table>
                         <thead>
                              <tr>
                                   <th>Wallet Address</th>
                                   <th>Amount</th>
                                   <th>Waiting Time</th>
                                   <th>Status</th>

                              </tr>
                         </thead>
                         <tbody>
                              <tr>
                                   <td data-column="Wallet Address">
                                        0xD9c15246107696b2Bc170967022A3B15Cf5F1A82
                                   </td>
                                   <td data-column="Amount">0.001</td>
                                   <td data-column="Waiting Time">2.00</td>
                                   <td data-column="Status">Completed</td>
                                                                 

                              </tr>

                              <tr>
                                   <td data-column="Wallet Address">
                                        0xD9c15246107696b2Bc170967022A3B15Cf5F1A82
                                   </td>
                                   <td data-column="Amount">0.001</td>
                                   <td data-column="Waiting Time">2.00</td>
                                   <td data-column="Status">Completed</td>
                                   
                              </tr>

                              <tr>
                                   <td data-column="Wallet Address">
                                        0xD9c15246107696b2Bc170967022A3B15Cf5F1A82
                                   </td>
                                   <td data-column="Amount">0.001</td>
                                   <td data-column="Waiting Time">2.00</td>
                                   <td data-column="Status">Running</td>
                                   

                              </tr>

                              <tr>
                                   <td data-column="Wallet Address">
                                        0xD9c15246107696b2Bc170967022A3B15Cf5F1A82
                                   </td>
                                   <td data-column="Amount">0.001</td>
                                   <td data-column="Waiting Time">2.00</td>
                                   <td data-column="Status">Waiting</td>
                                   
                              
                              </tr>
                         </tbody>
                    </table>
               </div>
          );
     }
}
