import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import RouterNames from "@/router/name";
import { APP_CONFIGS } from "~/config";
import { is } from "~/appCommon/extendBase/impls/utils/typeInferernce";

export function getRouterConfig(): Record<
  string,
  Array<RouteRecordRaw> | RouteRecordRaw
> {
  /** 區分 不同使用者已授權後 */

  /** Demo 只有在測試時會顯示 */
  const demoRoutes: Array<RouteRecordRaw> = [
    {
      path: "/",
      name: RouterNames.DemoLayout,
      component: () => import("@/layout/RouteView.vue"),
      children: [
        {
          path: "",
          name: RouterNames.DemoCounter,
          component: () => import("~/views/demos/CounterDemo.vue")
        }
      ]
    }
  ];

  return {
    demoRoutes,
  };
}

export function getAppRouter() {
  const { demoRoutes } =
    getRouterConfig();

  const routes: Array<RouteRecordRaw> = [
    ...(demoRoutes as Array<RouteRecordRaw>)
  ];

  console.log("routes:", routes);

  return createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  });
}
