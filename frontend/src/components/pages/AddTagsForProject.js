import React, { Component } from 'react';
import { API_URL } from '../..';

export class AddTagsForProject extends Component {
    state = {
        newTagInput: '',
        tags: [],
    };

    handleChange = (e) => {
        this.setState({ newTagInput: e.target.value });
    };

    handleAddTag = () => {
        const { newTagInput, tags } = this.state;
        if (newTagInput.trim() !== '') {
            const updatedTags = [...tags, newTagInput];
            this.setState({ tags: updatedTags, newTagInput: '' }, () => {
                localStorage.setItem('projectTags', JSON.stringify(updatedTags));
            });
        }
    };

    componentDidMount() {
        const savedTags = localStorage.getItem('projectTags');
        if (savedTags) {
            this.setState({ tags: JSON.parse(savedTags) });
        }
    }

    handleRemoveTag = (index) => {
        const updatedTags = [...this.state.tags];
        updatedTags.splice(index, 1);
        this.setState({ tags: updatedTags }, () => {
            localStorage.setItem('projectTags', JSON.stringify(updatedTags));
        });
    };

    render() {
        return (
            <div className=''>
                <div className="row mt-2">
                    <div className="col">
                        <input 
                            className="form-control" 
                            type="text"
                            value={this.state.newTagInput} 
                            onChange={this.handleChange}
                            placeholder='введите новые теги'
                            />
                    </div>
                    <div className="col">
                        <span className="fs-16 lh-24" style={{ fontSize: '14px',cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.handleAddTag}>добавить тег</span>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col">
                    {this.state.tags.map((tag, index) => (
                        <span key={index}>
                            <span className="fs-16 lh-24" style={{color:'#ffff', background:'#00abed', padding: '7px 10px', borderRadius: '50px', marginLeft:'5px'}}>{tag}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0,0,300,150"
                                style={{fill:"#ef627d", marginBottom:'20px', marginLeft:'5px', cursor:'pointer'}} onClick={() => this.handleRemoveTag(index)} >
                                <g fill="#ef627d" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                                <g transform="scale(10.66667,10.66667)">
                                    <path d="M4.99023,3.99023c-0.40692,0.00011 -0.77321,0.24676 -0.92633,0.62377c-0.15312,0.37701 -0.06255,0.80921 0.22907,1.09303l6.29297,6.29297l-6.29297,6.29297c-0.26124,0.25082 -0.36647,0.62327 -0.27511,0.97371c0.09136,0.35044 0.36503,0.62411 0.71547,0.71547c0.35044,0.09136 0.72289,-0.01388 0.97371,-0.27511l6.29297,-6.29297l6.29297,6.29297c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-6.29297,-6.29297l6.29297,-6.29297c0.29576,-0.28749 0.38469,-0.72707 0.22393,-1.10691c-0.16075,-0.37985 -0.53821,-0.62204 -0.9505,-0.60988c-0.2598,0.00774 -0.50638,0.11632 -0.6875,0.30273l-6.29297,6.29297l-6.29297,-6.29297c-0.18827,-0.19353 -0.4468,-0.30272 -0.7168,-0.30273z"></path>
                                </g>
                                </g>
                            </svg>
                        </span>
                    ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default AddTagsForProject;