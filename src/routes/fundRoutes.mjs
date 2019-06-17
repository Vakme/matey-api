import * as controller from '../controllers/fundController'

export function routes(app) {
  app.route('/users')
    .get(controller.list_all_users);
  
  app.route('/summary')
    .get(controller.sum_up_funds);
  
  app.route('/funds')
    .get(controller.get_user_expenses)
    .post(controller.add_expense)
    .delete(controller.remove_expense);
}