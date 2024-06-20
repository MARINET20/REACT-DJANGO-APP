import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { API_URL } from '../..';

export class RequirementList extends Component {
    state = {
        selectedSkills: [],
        newTagInput: '',
        skills: [],
        selectedProject: {
            skills: []
        },
        isFormSkillVisible: false
    };

    toggleFormSkillVisibility = () => {
        this.setState({ isFormSkillVisible: !this.state.isFormSkillVisible});
    };

    addNewRequirement = (event) => {
        event.preventDefault(); // Предотвращение действия по умолчанию
        if (this.state.newTagInput.trim() !== '') {
          const newSelectedSkill = {
            id: null,
            skill: this.state.newTagInput.trim(),
            weight_skill: 0
          };
      
          const selectedSkills = JSON.parse(localStorage.getItem('selectedSkill')) || [];
          selectedSkills.push(newSelectedSkill);
          localStorage.setItem('selectedSkill', JSON.stringify(selectedSkills));
      
          this.setState({ newTagInput: '', selectedSkills });
        }
    };

    componentDidMount() {
        fetch(`${API_URL}/skill`) 
        .then(response => response.json())
        .then(data => {
            const skills = data.map(obj => ({
                id: obj.id,
                skill: obj.skill,
                weight_skill: 0
            }));
            this.setState({ skills: skills });
        });
    }

    handleNewTagInputChange = (e) => {
        this.setState({ newTagInput: e.target.value });
    };

    handleSkillsChange = (selectedList) => {
        this.setState({ selectedSkills: selectedList }, () => {
            localStorage.setItem('selectedSkill', JSON.stringify(selectedList)); 
        });
    };

    updateWeight = (id, newWeight) => {        
        this.setState((prevState) => ({
            selectedSkills: prevState.selectedSkills.map(skill => {
                if (skill.id === id) {
                    return { ...skill, weight_skill: newWeight };
                }
                return skill;
            })
        }), () => {
            localStorage.setItem('selectedSkill', JSON.stringify(this.state.selectedSkills));
        });
    };

    removeRequirement = (id) => {
        const updatedSkills = this.state.selectedSkills.filter(skill => skill.id !== id);
        this.setState({ selectedSkills: updatedSkills }, () => {
            localStorage.setItem('selectedSkill', JSON.stringify(updatedSkills));
        });        
    };

    render() {
        return (
            <div className='mt-3'>
                <div className='flex'>
                <font color="red"><span className="form-required starrequired">* </span></font>
                <span style={{fontWeight:'600'}} >
                    <p> Укажите значимость каждого требования.</p>
                    <p style={{fontWeight:'600'}}>
                        1 - наименее важный
                        <br/>
                        5 - наиболее важный
                    </p>
                </span>
                </div>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                {this.state.selectedSkills.map(skill => (
                    <div key={skill.id}>
                        <p style={{fontWeight:'600', marginTop:'15px'}}>{skill.skill}</p>
                        <div style={{padding:'5px'}}> 
                        {[1, 2, 3, 4, 5].map((step) => (
                            <span
                            key={step}
                            style={{
                                backgroundColor: step === Math.round(parseFloat(skill.weight_skill) * 5) ? '#D5E6ED' : '#fff',
                                borderColor: step === Math.round(parseFloat(skill.weight_skill) * 5) ? '#00abed' : '#cccccc',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                color: step === Math.round(parseFloat(skill.weight_skill) * 5) ? '#00abed' : '#000',
                                padding: '15px',
                                margin: '0 4px',
                                cursor: 'pointer',
                                borderRadius: '5px'
                            }}
                            onClick={() => this.updateWeight(skill.id, step / 5)}
                            >
                            {step}
                            </span>
                        ))}
                        </div>
                    </div>
                ))}
                </div>
                <br/>
                {/* {this.state.selectedSkills.map(skill => (
                <div className='d-flex' key={skill.id}>
                    <span>{skill.skill}</span>
                    <div>
                        {[...Array(5)].map((_, index) => (
                            <svg key={index} xmlns="http://www.w3.org/2000/svg" width="25" height="25"  style={{fill: index < Math.round(parseFloat(skill.weight_skill) * 5) ? '#f0c313' : '#b9b9b9', margin: '3px 1px', cursor: 'pointer', marginLeft:'10px'}} onClick={() => this.updateWeight(skill.id, (index + 1) / 5)}>
                                <path d="M7.5 0l2.3 4.6h4.7l-3.4 3.3 1.2 6.6-6-3.4-6 3.4 1.3-6.6-3.4-3.3h4.6z"/>
                            </svg>
                        ))}
                    </div> */}
                {/* {this.state.selectedSkills.map(skill => (
                    <div className='d-flex' key={skill.id}>
                        <span>{skill.skill}</span>
                        <div>
                            {[...Array(10)].map((_, index) => (
                                <svg key={index} xmlns="http://www.w3.org/2000/svg" width="25" height="25" style={{fill: index < Math.round(parseFloat(skill.weight_skill) * 10) ? '#f0c313' : '#b9b9b9', margin: '3px 1px', cursor: 'pointer', marginLeft:'10px'}} onClick={() => this.updateWeight(skill.id, (index + 1) / 10)}>
                                  <path d="M7.5 0l2.3 4.6h4.7l-3.4 3.3 1.2 6.6-6-3.4-6 3.4 1.3-6.6-3.4-3.3h4.6z"/>
                                </svg>
                            ))}
                        </div> */}
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0,0,300,150"
                            style={{fill:"#ef627d", marginBottom:'10px', marginLeft:'10px', cursor:'pointer'}} onClick={() => this.removeRequirement(skill.id)} >
                            <g fill="#ef627d" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                            <g transform="scale(10.66667,10.66667)">
                                <path d="M4.99023,3.99023c-0.40692,0.00011 -0.77321,0.24676 -0.92633,0.62377c-0.15312,0.37701 -0.06255,0.80921 0.22907,1.09303l6.29297,6.29297l-6.29297,6.29297c-0.26124,0.25082 -0.36647,0.62327 -0.27511,0.97371c0.09136,0.35044 0.36503,0.62411 0.71547,0.71547c0.35044,0.09136 0.72289,-0.01388 0.97371,-0.27511l6.29297,-6.29297l6.29297,6.29297c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-6.29297,-6.29297l6.29297,-6.29297c0.25082,-0.26124 0.36648,-0.62327 0.27512,-0.97371c-0.09136,-0.35044 -0.36503,-0.62411 -0.71547,-0.71547c-0.35045,-0.09136 -0.72289,0.01388 -0.97371,0.27511l-6.29297,6.29297l-6.29297,-6.29297c-0.25852,-0.29831 -0.69317,-0.35115 -0.9929,-0.09205c-0.29972,0.2591 -0.35116,0.69378 -0.09205,0.99351c0.09461,0.10954 0.23421,0.19187 0.39324,0.23504z"></path>
                            </g>
                            </g>
                        </svg> */}
                    {/* </div>
                ))} */}
                <Multiselect 
                    className='mt-3'
                    options={this.state.skills} 
                    selectedValues={this.state.selectedSkills}
                    onSelect={this.handleSkillsChange}
                    onRemove={this.handleSkillsChange}
                    placeholder='требования из списка'
                    displayValue="skill"
                />

                <div className='d-flex mt-2'>
                    <img width="32" height="32" 
                    onClick={this.toggleFormSkillVisibility}
                    style={{ cursor: 'pointer', marginLeft:'5px'}}
                    src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                    <p style={{ color: "#00aeef"}}><small>Добавить требования, которых нет в списке</small></p>
                </div>

                {this.state.isFormSkillVisible && (
                    <div>
                        <input
                            type="text"
                            value={this.state.newTagInput}
                            onChange={this.handleNewTagInputChange}
                        />
                        <span className="lh-24" style={{ fontSize: '14px',marginLeft:'10px', cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.addNewRequirement}>добавить навык</span>
                    </div>
                )}
            </div>
        );
    }
}

export default RequirementList