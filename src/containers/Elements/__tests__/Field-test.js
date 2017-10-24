/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Field, { makeRenderInput } from '../Field';

const attributes = {
  label: 'Name',
  name: 'name',
  component: 'Alphanumeric',
};

const validation = {
  required: true,
  minLength: 2,
};

const reduxFormFieldProperties = { input: { name: 'foo', value: '' }, meta: { invalid: false } };

describe('makeRenderInput()', () => {
  it('should return renderable component', () => {
    const Input = makeRenderInput('Alphanumeric');

    const subject = shallow((
      <Input {...reduxFormFieldProperties} />
    ));

    expect(subject).toMatchSnapshot();
  });
});

describe('<Field />', () => {
  it('should render', () => {
    const subject = shallow((
      <Field {...attributes} />
    ));

    expect(subject).toMatchSnapshot();
  });

  it('Loads validations from the register', () => {
    const field = shallow(<Field {...attributes} validation={validation} />);

    const validate = field.find('Field').prop('validate');

    expect(validate.length).toBe(2);
  });

  it('Loads options with optionsSelector');
});
