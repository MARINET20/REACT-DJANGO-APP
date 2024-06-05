import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { API_URL } from '../..';

export class CuratorProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCurator: [],
            newTagInput: '',
            curator: [],
            isFormVisible: false
        };
    }

    componentDidMount() {
        fetch(`${API_URL}/teachers`) 
        .then(response => response.json())
        .then(data => {
            const curator = data.map(obj => ({
                id: obj.id,
                name: obj.name
            }));
            this.setState({ curator: curator });
        });
    }

    handleCuratorChange = (selectedList) => {
        this.setState({ selectedCurator: selectedList }, () => {
            const id = this.state.selectedCurator.map(obj => obj.id);
            localStorage.setItem('selectedCurators', JSON.stringify(id)); // Сохраняем выбранные кураторы в localStorage
        });
    };
    
    handleNewTagInputChange = (e) => {
        this.setState({ newTagInput: e.target.value });
    };

  render() {
    return (
      <div>
        <div className="row mt-3">
            <div className="col">
                <Multiselect
                    options={this.state.curator}
                    placeholder="куратор"
                    selectedValues={this.state.selectedCurator} 
                    onSelect={this.handleCuratorChange}
                    onRemove={this.handleCuratorChange}
                    displayValue="name"
                />
            </div>
        </div>
      </div>
    )
  }
}

export default CuratorProject