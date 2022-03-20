import {StyleSheet} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

export function TokenSelectDropDown(props) {
  return (
    <SelectDropdown
      buttonStyle={styles.button}
      // buttonTextStyle={}
      // dropdownStyle={}
      // defaultValue={props.defaultValue || false}
      data={props.tokens}
      onSelect={(selectedItem, index) => {
        props.updateMint(selectedItem);
      }}
      buttonTextAfterSelection={(selectedItem, index) => {
        // text represented after item is selected
        // if data array is an array of objects then return selectedItem.property to render after item is selected
        return selectedItem.name;
      }}
      rowTextForSelection={(item, index) => {
        // text represented for each item in dropdown
        // if data array is an array of objects then return item.property to represent item in dropdown
        // console.log(item);
        return item.name;
      }}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: 'red',
    borderWidth: 3,
    borderStyle: 'solid',
    width: '95%',
  },
});
