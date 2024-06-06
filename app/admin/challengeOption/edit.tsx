import { SimpleForm, Create, TextInput, required, ReferenceInput, NumberInput, SelectInput, BooleanInput, Edit } from "react-admin"


export const ChallengeOptionEdit = () => {
    return (
        <Edit>
            <SimpleForm >
                <TextInput 
                    source="text"
                    validate={[required()]} 
                    label="Text" 
                />
                <BooleanInput 
                    source="correct"
                    label="Correct option"
                />
                <ReferenceInput 
                    source="challengeId"
                    reference="challenges"
                />
                <TextInput 
                    source="imageSrc"
                    validate={[required()]}
                    label="Image Url" 
                />
                <TextInput 
                    source="audioSrc"
                    validate={[required()]}
                    label="Audio Url" 
                />
            </SimpleForm>
        </Edit>
    )
}