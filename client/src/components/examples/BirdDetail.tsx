import BirdDetail from '@/pages/BirdDetail';
import { Router, Route } from 'wouter';

export default function BirdDetailExample() {
  return (
    <Router base="/bird">
      <Route path="/:id" component={BirdDetail} />
      <Route path="/">
        {() => {
          window.location.hash = '/bird/12';
          return null;
        }}
      </Route>
    </Router>
  );
}
