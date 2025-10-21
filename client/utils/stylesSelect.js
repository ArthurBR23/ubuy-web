export const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: '#d9d9d933', // Fundo cinza com opacidade
    borderRadius: '4px',
    borderColor: '#616161',
    minHeight: '20px', // Altura menor
    fontSize: '12px', // Texto menor
    padding: '0 4px',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0',
    height: '24px',
    maxWidth: '200px', // Limita a altura do valor selecionado
    overflowY: 'auto', // Adiciona rolagem vertical para os valores selecionados
    overflowX: 'hidden',
  }),
  input: (base) => ({
    ...base,
    fontSize: '12px',
    margin: '0',
  }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#ccc' // Fundo cinza para a opção selecionada
      : state.isFocused
      ? '#777777'
      : '#535353',
    color: '#ffffff',
    fontSize: '12px',
    padding: '4px',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#d9d9d933', // Fundo cinza com opacidade para as tags
    color: '#fafafa',
    borderRadius: '2px',
    padding: '0 2px',
    height: '20px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: '10px',
    color: '#fafafa',
  }),
  multiValueRemove: (base) => ({
    ...base,
    fontSize: '10px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#ff6666',
      color: 'white',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#fafafa',
    fontSize: '12px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#535353',
    maxHeight: '200px', // Limita a altura do menu
    overflowY: 'auto', // Permite rolagem vertical
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px', // Limita a altura das opções
    overflowY: 'auto', // Permite rolagem vertical
  }),
};
