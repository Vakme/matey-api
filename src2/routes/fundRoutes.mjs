import * as controller from '../controllers/fundController'

export function routes(app) {
  app.route('/')
      .get(controller.health_check);

  app.route('/users')
    .get(controller.list_all_users);
  
  app.route('/summary')
    .get(controller.sum_up_funds);
  
  app.route('/funds')
    .get(controller.get_user_expenses)
    .post(controller.add_expense);
  
  app.route('/funds/:name')
    .delete(controller.remove_expense);
}