import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { API_URL } from '../..';

export class MyComponentTag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTags: [],
            newTagInput: '',
            tags: [],
            isFormVisible: false
        };
    }

    componentDidMount() {
        fetch(`${API_URL}/tags`) 
        .then(response => response.json())
        .then(data => {
            const tags = data.map(obj => ({
                id: obj.id,
                tag: obj.tag
            }));
            this.setState({ tags: tags });
        });
    }

    handleTagsChange = (selectedList) => {
        this.setState({ selectedTags: selectedList }, () => {
            const id = this.state.selectedTags.map(obj => obj.id);
            localStorage.setItem('selectedTags', JSON.stringify(id));  // Сохраняем  в localStorage
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
                    options={this.state.tags}
                    placeholder="теги"
                    selectedValues={this.state.selectedTags} 
                    onSelect={this.handleTagsChange}
                    onRemove={this.handleTagsChange}
                    displayValue="tag"
                />
            </div>
        </div>
      </div>
    )
  }
}

export default MyComponentTag