import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CommonResponseDTO } from '../../dtos/common.dto';
import {
  AcceptRestaurantInvitationRequestBodyDTO,
  AcceptRestaurantInvitationResponseBodyDTO,
  CreateRestaurantInvitationRequestBodyDTO,
  RestaurantInvitationPreviewResponseBodyDTO,
  RestaurantInvitationTokenPathParamsDTO,
  RestaurantTeamInvitationDTO,
  RestaurantTeamMemberDTO,
  RestaurantTeamResourcePathParamsDTO,
  RestaurantTeamResponseBodyDTO,
  UpdateRestaurantMemberRoleRequestBodyDTO,
} from '../../dtos/restaurant-team.dto';
import { AuthenticatedRequest } from '../../middleware/authentication.middleware';
import * as restaurantTeamService from '../../services/restaurant-team.service';
import { UnauthorizedError } from '../../utils/errors';
import { logger } from '../../utils/logger';

const getAuthenticatedUserId = (req: unknown): string => {
  const userId = (req as AuthenticatedRequest).user?.userId;
  if (!userId) {
    throw new UnauthorizedError('User not found in token');
  }
  return userId;
};

export const getRestaurantTeam = async (
  req: Request,
  res: Response<CommonResponseDTO<RestaurantTeamResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const team = await restaurantTeamService.getRestaurantTeam(userId);
    logger.info({ userId, memberCount: team.members.length }, 'Restaurant team retrieved');
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant team retrieved successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurantInvitation = async (
  req: Request<
    unknown,
    CommonResponseDTO<RestaurantTeamInvitationDTO>,
    CreateRestaurantInvitationRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<RestaurantTeamInvitationDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const invitation = await restaurantTeamService.createRestaurantInvitation(userId, req.body);
    logger.info(
      { userId, invitationId: invitation.id, role: invitation.role },
      'Restaurant team invitation created'
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Restaurant team invitation sent successfully',
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantMemberRole = async (
  req: Request<
    RestaurantTeamResourcePathParamsDTO,
    CommonResponseDTO<RestaurantTeamMemberDTO>,
    UpdateRestaurantMemberRoleRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<RestaurantTeamMemberDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const member = await restaurantTeamService.updateRestaurantMemberRole(
      userId,
      req.params.id,
      req.body.role
    );
    logger.info(
      { userId, membershipId: member.id, role: member.role },
      'Restaurant team member role updated'
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant team member role updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeRestaurantMember = async (
  req: Request<RestaurantTeamResourcePathParamsDTO>,
  res: Response<CommonResponseDTO<RestaurantTeamMemberDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const member = await restaurantTeamService.removeRestaurantMember(userId, req.params.id);
    logger.info({ userId, membershipId: member.id }, 'Restaurant team member removed');
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant team member removed successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRestaurantInvitation = async (
  req: Request<RestaurantTeamResourcePathParamsDTO>,
  res: Response<CommonResponseDTO>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    await restaurantTeamService.cancelRestaurantInvitation(userId, req.params.id);
    logger.info({ userId, invitationId: req.params.id }, 'Restaurant invitation cancelled');
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant invitation cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantInvitationPreview = async (
  req: Request<RestaurantInvitationTokenPathParamsDTO>,
  res: Response<CommonResponseDTO<RestaurantInvitationPreviewResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const invitation = await restaurantTeamService.getRestaurantInvitationPreview(req.params.token);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant invitation retrieved successfully',
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRestaurantInvitation = async (
  req: Request<
    RestaurantInvitationTokenPathParamsDTO,
    CommonResponseDTO<AcceptRestaurantInvitationResponseBodyDTO>,
    AcceptRestaurantInvitationRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<AcceptRestaurantInvitationResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const membership = await restaurantTeamService.acceptRestaurantInvitation(
      req.params.token,
      req.body
    );
    logger.info(
      { restaurantId: membership.restaurantId, role: membership.role },
      'Restaurant invitation accepted'
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant invitation accepted successfully',
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};
