import { Component, PropsWithChildren } from 'react';
import './i18n';
import './app.scss';

class App extends Component<PropsWithChildren> {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children;
  }
}

export default App;
