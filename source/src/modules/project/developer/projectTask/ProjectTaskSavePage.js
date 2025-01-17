import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import { categoryKind } from '@constants/masterData';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { generatePath, useParams } from 'react-router-dom';
import routes from '@routes';
import LeaderProjectTaskForm from './ProjectTaskForm';
import useTranslate from '@hooks/useTranslate';
import { defineMessages } from 'react-intl';
import { commonMessage } from '@locales/intl';
import { showErrorMessage } from '@services/notifyService';

const messages = defineMessages({
    objectName: 'Task',
});

function DeveloperProjectTaskSavePage() {
    const translate = useTranslate();
    const queryParameters = new URLSearchParams(window.location.search);
    const projectId = queryParameters.get('projectId');
    const projectName = queryParameters.get('projectName');
    const active = queryParameters.get('active');
    const projectTaskId = useParams();
    const { detail, onSave, mixinFuncs, setIsChangedFormValues, isEditing, errors, loading, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.projectTask.getById,
            create: apiConfig.projectTask.create,
            update: apiConfig.projectTask.update,
        },
        options: {
            getListUrl: generatePath(
                routes.developerProjectTabPage.path,
                active ? { projectId, projectName, active } : { projectId, projectName },
            ),
            objectName: translate.formatMessage(messages.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                    status: 1,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    projectId: projectId,
                    userId: data.developerId,
                };
            };
            funcs.onSaveError = (err) => {
                if (err.code === 'ERROR-PROJECT-ERROR-0001') {
                    showErrorMessage('Dự án đã hoàn thành không thể tạo thêm task');
                    mixinFuncs.setSubmit(false);
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                    mixinFuncs.setSubmit(false);
                }
            };
        },
    });
    const setBreadRoutes = () => {
        const breadRoutes = [
            {
                breadcrumbName: translate.formatMessage(commonMessage.project),
                path: routes.developerProjectListPage.path,
            },
        ];

        if (active) {
            breadRoutes.push({
                breadcrumbName: translate.formatMessage(commonMessage.generalManage),
                path:
                    routes.developerProjectTabPage.path + `?projectId=${projectId}&projectName=${projectName}&active=${active}`,
            });
        } else {
            breadRoutes.push({
                breadcrumbName: translate.formatMessage(commonMessage.generalManage),
                path: routes.developerProjectTabPage.path + `?projectId=${projectId}&projectName=${projectName}`,
            });
        }
        breadRoutes.push({ breadcrumbName: title });

        return breadRoutes;
    };
    return (
        <PageWrapper loading={loading} routes={setBreadRoutes()} title={title}>
            <LeaderProjectTaskForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
            />
        </PageWrapper>
    );
}

export default DeveloperProjectTaskSavePage;
