import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import useSaveBase from '@hooks/useSaveBase';
import { accountActions } from '@store/actions';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';

const message = defineMessages({
    objectName: 'profile',
});

const ProfilePage = () => {
    const translate = useTranslate();
    const [detail, setDetail] = useState({});
    const { execute, loading } = useFetch({ ...apiConfig.account.getProfile }, { immediate: false });
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile);
    const { mixinFuncs, onSave, setIsChangedFormValues, isEditing } = useSaveBase({
        options: {
            getListUrl: routes.profilePage.path,
            objectName: translate.formatMessage(message.objectName),
        },
        apiConfig: {
            getById: apiConfig.account.getProfile,
            update: apiConfig.account.updateProfile,
        },
        override: (funcs) => {
            const onSaveCompleted = funcs.onSaveCompleted;

            funcs.onSaveCompleted = (response) => {
                onSaveCompleted(response);
                executeGetProfile();
            };
            funcs.onSaveError = (err) => {
                if (err.code === 'ERROR-ACCOUNT-0003') {
                    showErrorMessage(translate.formatMessage(commonMessage.error),translate.formatMessage(commonMessage.currentPasswordWrong));
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                }
                mixinFuncs.setSubmit(false);
            };
        },
    });

    useEffect(() => {
        execute({
            onCompleted: (response) => {
                if (response.result === true) setDetail(response.data);
            },
            onError: mixinFuncs.handleGetDetailError,
        });
    }, []);

    return (
        <PageWrapper loading={loading} routes={[{ breadcrumbName: translate.formatMessage(commonMessage.profile) }]}>
            <ProfileForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
            />
        </PageWrapper>
    );
};

export default ProfilePage;
