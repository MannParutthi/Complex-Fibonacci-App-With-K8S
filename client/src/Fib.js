import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
  };

  componentDidMount() { // React lifecycle method that is called automatically when the component is rendered
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({
      seenIndexes: seenIndexes.data,
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the browser from attempting to submit the form automatically

    await axios.post('/api/values', { // Post the index to the backend API to be calculated
      index: this.state.index,
    });
    this.setState({ index: '' }); // Clear out the input box after the form is submitted
  };

  renderSeenIndexes() { // Helper method to render the list of indexes we have seen
    return this.state.seenIndexes.map(({ number }) => number).join(', ');
  }

  renderValues() { // Helper method to render the calculated values
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key}, I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <h1>
          <form onSubmit={this.handleSubmit}>
            <label>Enter your index:</label>
            <input
              value={this.state.index}
              onChange={(event) => this.setState({ index: event.target.value })}
            />
            <button>Submit</button>
          </form>

          <h3>Indexes I have seen:</h3>
          {this.renderSeenIndexes()}

          <h3>Calculated Values:</h3>
          {this.renderValues()}
        </h1>
      </div>
    );
  }
}

export default Fib;
