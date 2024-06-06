import { BooleanField, Datagrid, List, NumberField, ReferenceField, SelectField, TextField } from "react-admin"


export const ChallengeOptionList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="question" />
                <BooleanField source="correct" />
                <ReferenceField source="challengeId" reference="challenges" />
                <TextField source="imageSrc" />
                <TextField source="audioSrc" />
            </Datagrid>
        </List>
    )
}